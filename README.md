# 🤖 Kotu's Intelligent System

A premium, state-of-the-art Inventory & Supply Chain Management platform with an integrated Artificial Intelligence assistant. Specifically engineered for uniform vendor operations, this system bridges the gap between complex logistical data and seamless user interaction.

---

## 🌟 Key Features

### 💬 Intelligent Conversational Assistant
The heart of the system is the **Kotu Assistant**, a smart chatbot designed to handle complex natural language queries for both customers and administrators.

- **Dynamic Slot Filling**: Automatically identifies schools (Shiv Nadar, Knowledge Habitat), categories (Uniforms, Shoes, Socks), colors, and sizes from plain text.
- **Smart Size Guidance**: If a user is unsure of their size, Kotu provides an interactive conversion guide (UK Chest Sizes to Age-based sizes) and directs them to the best-stocked outlet.
- **Multi-Turn Context**: Maintains conversational state to guide users through a logical check flow (School → Category → Color → Size → Outlet).

### 📊 Advanced Admin Analytics
Empower your supply chain decisions with data-driven insights:
- **Time-Based Analysis**: Query today's, yesterday's, or the past week's performance directly through chat.
- **Refill Intelligence**: Proactive alerts for items that are low in stock across specific regional centers.
- **Popularity Tracking**: Real-time identification of the most popular items by volume.

### 🖥️ High-Fidelity Dashboard
A modern, dark-themed interface built for performance and aesthetics:
- **Interactive Data Filtering**: Filter analytics by Day, Week, Month, or Year. 
- **Custom Calendar Range**: Precise date selection for historical tracking.
- **Regional Outlet Management**: Visualized statistics across 5 distinct distribution hubs.
- **Micro-Animations**: Smooth transitions using Framer Motion for a premium user experience.

---

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Vanilla CSS + Tailwind CSS (Glassmorphism & Dark Mode)
- **Backend**: Node.js + Express
- **Database**: SQLite (Fast, Local-first persistence)
- **AI Engine**: Google Gemini API (Configurable)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- A Gemini API Key

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Mohitlikestocode/Smart-Uniform-Vendor-Supply-Chain-Management-Agent-For-Kotu-
   cd Smart-Uniform-Vendor-Supply-Chain-Management-Agent-For-Kotu-
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch Application**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## 📋 Conversational Examples

**Customer Queries:**
- *"Do you have the SNS sports uniform in red, size 10-12Y at outlet 1?"*
- *"I'm looking for shoes for Shiv Nadar school but I don't know my size help."*
- *"Check availability for Knowledge Habitat socks in size 8."*

**Admin/Manager Queries:**
- *"Give me today's analysis."*
- *"Is there any stock that needs to get refilled?"*
- *"Show me the summary for the last 7 days."*

---

<p align="center">
  Developed by <b>Antigravity AI</b> for <b>Kotu's Supply Chain</b>
</p>
