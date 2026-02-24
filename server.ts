import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("inventory.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    item_name TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT,
    outlet_id INTEGER NOT NULL,
    quantity_available INTEGER DEFAULT 0,
    quantity_sold INTEGER DEFAULT 0,
    quantity_incoming INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    details TEXT,
    user_role TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sales_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_id INTEGER,
    quantity INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Data if empty
const rowCount = db.prepare("SELECT COUNT(*) as count FROM inventory").get() as { count: number };
if (rowCount.count === 0) {
  const schools = ["Complete Shiv Nadar School", "Knowledge Habitat School"];
  const categories = ["Normal Uniform", "Shoes", "Socks", "Sports Uniform"];
  const sizes = ["2–4Y", "4–6Y", "6–8Y", "8–10Y", "10–12Y", "12–14Y", "14Y+"];
  const shoeSizes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13+"];
  const colors = ["Red", "Blue", "Green", "Yellow"]; // House colors
  const outlets = [1, 2, 3, 4, 5];

  const insert = db.prepare(`
    INSERT INTO inventory (school, category, item_name, size, color, outlet_id, quantity_available, quantity_sold, quantity_incoming)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSales = db.prepare(`
    INSERT INTO sales_log (inventory_id, quantity, timestamp)
    VALUES (?, ?, ?)
  `);

  schools.forEach(school => {
    categories.forEach(cat => {
      const currentSizes = cat === "Shoes" ? shoeSizes : sizes;
      currentSizes.forEach(size => {
        outlets.forEach(outlet => {
          const avail = Math.floor(Math.random() * 50);
          const sold = Math.floor(Math.random() * 20);
          const incoming = Math.floor(Math.random() * 30);

          const displayName = cat === "Normal Uniform" ? "Uniform" : cat;
          if (cat === "Sports Uniform") {
            colors.forEach(color => {
              const info = insert.run(school, cat, displayName, size, color, outlet, avail, sold, incoming);
              for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                insertSales.run(info.lastInsertRowid, Math.floor(Math.random() * 5), date.toISOString());
              }
            });
          } else {
            const color = cat === "Normal Uniform" ? "Standard" : null;
            const info = insert.run(school, cat, displayName, size, color, outlet, avail, sold, incoming);
            for (let i = 0; i < 7; i++) {
              const date = new Date();
              date.setDate(date.getDate() - i);
              insertSales.run(info.lastInsertRowid, Math.floor(Math.random() * 5), date.toISOString());
            }
          }
        });
      });
    });
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory session store for chat context
  const chatSessions = new Map<string, any>();

  // API Routes
  app.get("/api/inventory", (req, res) => {
    const { outletId, type } = req.query;
    let query = "SELECT * FROM inventory";
    const params = [];

    if (outletId) {
      query += " WHERE outlet_id = ?";
      params.push(outletId);
    }

    const data = db.prepare(query).all(...params);
    res.json(data);
  });

  app.get("/api/summary", (req, res) => {
    const { outletId } = req.query;
    let query = `
      SELECT 
        SUM(quantity_available) as total_available,
        SUM(quantity_sold) as total_sold,
        SUM(quantity_incoming) as total_incoming,
        COUNT(CASE WHEN quantity_available < 5 THEN 1 END) as low_stock_count
      FROM inventory
    `;
    const params = [];

    if (outletId && outletId !== 'all') {
      query += " WHERE outlet_id = ?";
      params.push(outletId);
    }

    const summary = db.prepare(query).get(...params);
    res.json(summary);
  });

  app.post("/api/chat", async (req, res) => {
    const { message, role, sessionId } = req.body;
    const text = message.toLowerCase();

    console.log(`[Chat] Processing for ${role} (Session: ${sessionId}): "${message}"`);

    // 1. Initialize or Retrieve Session Slots
    let slots = chatSessions.get(sessionId) || {
      school: null,
      category: null,
      size: null,
      color: null,
      outlet_id: null,
      intent: 'availability_check'
    };

    // 2. Deterministic Slot Filling (Update existing slots)

    // Detect School
    if (text.includes("shiv") || text.includes("nadar") || text.includes("sns")) slots.school = "Complete Shiv Nadar School";
    else if (text.includes("knowledge") || text.includes("habitat") || text.includes("khs")) slots.school = "Knowledge Habitat School";

    // Detect Category
    if (text.includes("sport") || text.includes("pt") || text.includes("track")) slots.category = "Sports Uniform";
    else if (text.includes("uniform") || text.includes("dress") || text.includes("shirt") || text.includes("pant")) slots.category = "Normal Uniform";
    else if (text.includes("shoe") || text.includes("footwear")) slots.category = "Shoes";
    else if (text.includes("sock")) slots.category = "Socks";

    // Detect Color
    const colors = ["red", "blue", "green", "yellow"];
    colors.forEach(c => {
      if (text.includes(c)) slots.color = c.charAt(0).toUpperCase() + c.slice(1);
    });

    // Detect Size
    const sizeGuidanceKeywords = ["don't know", "dont know", "not sure", "size help", "which size", "what size"];
    const needsSizeGuidance = sizeGuidanceKeywords.some(kw => text.includes(kw));

    const sizeRegex = /(\d+[-–]\d+y|\d+y\+)/g;
    const sizeMatch = text.match(sizeRegex);
    if (sizeMatch) {
      slots.size = sizeMatch[0].toUpperCase().replace("-", "–");
    } else {
      // Try numeric shoe size or clothing size
      const shoeSizeMatch = text.match(/\b(size\s+)?(\d+)\b/);
      if (shoeSizeMatch) {
        const val = parseInt(shoeSizeMatch[2]);
        if (val > 5 || text.includes("size")) {
          // Check if it's a UK chest size and convert
          if (val >= 24 && val <= 40) {
            const ukToAge: Record<number, string> = {
              24: "2–4Y", 26: "4–6Y", 28: "6–8Y", 30: "8–10Y", 32: "10–12Y", 34: "12–14Y", 36: "14Y+"
            };
            slots.size = ukToAge[val] || shoeSizeMatch[2];
          } else {
            slots.size = shoeSizeMatch[2];
          }
        }
      }
    }

    // Detect Outlet
    const outletMatch = text.match(/outlet\s*(\d)/) || text.match(/center\s*(\d)/) || text.match(/hub\s*(\d)/);
    if (outletMatch) {
      slots.outlet_id = parseInt(outletMatch[1]);
    } else {
      // Fallback: look for a lone number 1-5 if we don't have outlet_id yet
      const loneNumberMatch = text.match(/\b([1-5])\b/);
      if (loneNumberMatch && !slots.outlet_id && !text.includes("size") && !text.includes("year") && !text.includes("age")) {
        slots.outlet_id = parseInt(loneNumberMatch[1]);
      }
    }

    // Detect Admin Intents
    if (role === 'admin') {
      if (text.includes("low stock") || text.includes("alert") || text.includes("refill") || text.includes("reorder")) slots.intent = "low_stock_alert";
      else if (text.includes("summary") || text.includes("total") || text.includes("analysis") || text.includes("report")) slots.intent = "summary";
    }

    // Save updated slots back to session
    chatSessions.set(sessionId, slots);

    console.log("[Chat] Updated slots:", slots);

    // 3. Process Intent
    try {
      if (role === 'admin') {
        if (slots.intent === 'low_stock_alert') {
          const lowStock = db.prepare("SELECT item_name, quantity_available, outlet_id FROM inventory WHERE quantity_available < 10 LIMIT 8").all();
          chatSessions.delete(sessionId);
          if (lowStock.length === 0) return res.json({ reply: "All stock levels are currently optimal. No low-stock alerts recorded.", slots });
          const items = lowStock.map((i: any) => `• ${i.item_name} (Outlet ${i.outlet_id}): ${i.quantity_available} units left.`).join("\n");
          return res.json({ reply: `⚠️ **Stock Refill Needed:**\nBased on current levels, these items should be refilled soon:\n${items}`, slots });
        }
        if (slots.intent === 'summary') {
          let period = "the last 7 days";
          let dateFilter = "DATETIME(timestamp) >= DATETIME('now', '-7 days')";

          if (text.includes("today")) {
            period = "today";
            dateFilter = "DATE(timestamp) = DATE('now')";
          } else if (text.includes("yesterday")) {
            period = "yesterday";
            dateFilter = "DATE(timestamp) = DATE('now', '-1 day')";
          }

          const totals = db.prepare(`SELECT SUM(quantity) as total_qty FROM sales_log WHERE ${dateFilter}`).get() as any;
          const mostSold = db.prepare(`
            SELECT i.item_name, SUM(s.quantity) as qty 
            FROM sales_log s 
            JOIN inventory i ON s.inventory_id = i.id 
            WHERE ${dateFilter}
            GROUP BY i.item_name 
            ORDER BY qty DESC LIMIT 1
          `).get() as any;

          chatSessions.delete(sessionId);

          let reply = `📊 **Inventory Analysis (${period}):**\n`;
          reply += `• Total Units Moved: ${totals?.total_qty || 0}\n`;
          if (mostSold) reply += `• Most Popular Item: ${mostSold.item_name} (${mostSold.qty} units)\n`;
          reply += `\nSystem performance is stable across all distribution centers.`;

          return res.json({ reply, slots });
        }
      }

      // 4. Availability Check Logic with Smart Clarification

      // Question 1: Basic Info (School/Category)
      if (!slots.school || !slots.category) {
        const missing = [];
        if (!slots.school) missing.push("school (Complete Shiv Nadar or Knowledge Habitat)");
        if (!slots.category) missing.push("item type (Uniform, Shoes, Sports, etc.)");
        return res.json({
          reply: `I can help with that! To get started, please let me know the ${missing.join(" and ")}.`,
          slots
        });
      }

      // Question 2: Color (for Sports)
      if (slots.category === "Sports Uniform" && !slots.color) {
        return res.json({
          reply: `Sounds good! Which uniform color would you like to check about (Red, Blue, Green, or Yellow)?`,
          slots
        });
      }

      // Question 3: Size
      const sizeGuidanceKeywords = ["don't know", "dont know", "not sure", "size help", "which size", "what size", "unsure", "i don't know"];
      const containsGuidanceKeyword = sizeGuidanceKeywords.some(kw => text.includes(kw));

      if (!slots.size || containsGuidanceKeyword) {
        const sizeChart = `📏 **Size Conversion Guide:**
• UK 24 → Age 2-4Y
• UK 26 → Age 4-6Y
• UK 28 → Age 6-8Y
• UK 30 → Age 8-10Y
• UK 32 → Age 10-12Y
• UK 34 → Age 12-14Y
• UK 36+ → Age 14Y+

No worries if you're unsure! **Outlet 1** usually carries our most comprehensive range of sizes. Would you like to check a specific one from the list above?`;

        // Ensure the session state reflects that we still need a size
        slots.size = null;
        chatSessions.set(sessionId, slots);

        return res.json({
          reply: sizeChart,
          slots
        });
      }

      // Question 4: Outlet
      if (!slots.outlet_id) {
        return res.json({
          reply: `Got it. Last thing, which Outlet (1-5) should I check for you? (Note: Outlet 1 usually has the most variety in stock).`,
          slots
        });
      }

      // Final Check
      let query = "SELECT quantity_available FROM inventory WHERE school = ? AND category = ? AND size = ? AND outlet_id = ?";
      const params = [slots.school, slots.category, slots.size, slots.outlet_id];

      if (slots.color) {
        query += " AND color = ?";
        params.push(slots.color);
      } else {
        query += " AND (color = 'Standard' OR color IS NULL)";
      }

      const item = db.prepare(query).get(...params) as any;

      // Clear session after successful check
      chatSessions.delete(sessionId);

      if (item) {
        const hasStock = item.quantity_available > 0;
        const status = hasStock ? "in stock" : "out of stock";
        const colorStr = slots.color ? ` (${slots.color})` : "";

        const reply = hasStock
          ? `Yes, we have ${slots.school} ${slots.category}${colorStr} in Size ${slots.size} in stock at Outlet ${slots.outlet_id}.`
          : `I'm sorry, ${slots.school} ${slots.category}${colorStr} in Size ${slots.size} is currently out of stock at Outlet ${slots.outlet_id}.`;

        return res.json({ reply, slots });
      } else {
        return res.json({
          reply: `I couldn't find a record for ${slots.school} ${slots.category} in Size ${slots.size} at Outlet ${slots.outlet_id}. Please verify the details.`,
          slots
        });
      }

    } catch (error: any) {
      console.error("[Chat] Processing Error:", error);
      return res.status(500).json({ error: "I encountered an error processing your request." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
