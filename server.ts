import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import axios from "axios";
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
if (apiKey) {
  console.log("Gemini API Key found (using " + (process.env.GEMINI_API_KEY ? "GEMINI_API_KEY" : "VITE_GEMINI_API_KEY") + ")");
} else {
  console.warn("No Gemini API Key found in environment variables.");
}
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to validate token (simplified for now as real validation is on client)
const isTokenValid = async (token: string) => {
  if (token === "adminwaleed786") return true;
  return !!token;
};

// Gemini Proxy Endpoint
app.post("/api/generate-ai-signal", async (req, res) => {
  try {
    const { prompt, token } = req.body;
    
    if (!await isTokenValid(token)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!genAI) {
      return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
    }

    const modelsToTry = [
      "gemini-3-flash-preview",
      "gemini-3.1-flash-lite-preview",
      "gemini-3.1-pro-preview"
    ];

    let lastError = null;
    let text = "";

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting signal generation with model: ${modelName}`);
        const response = await genAI.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { 
            responseMimeType: "application/json"
          }
        });
        text = response.text || "";
        if (text) break;
      } catch (err: any) {
        console.warn(`Model ${modelName} failed:`, err.message);
        lastError = err;
      }
    }

    if (!text && lastError) {
      throw lastError;
    }
    
    res.json({ text });
  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI signal" });
  }
});

// API for Binance Future Symbols
app.get("/api/binance-symbols", async (req, res) => {
  try {
    const response = await axios.get("https://fapi.binance.com/fapi/v1/exchangeInfo");
    const symbols = response.data.symbols
      .filter((s: any) => s.status === "TRADING")
      .map((s: any) => s.symbol);
    res.json(symbols);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch symbols" });
  }
});

// API for signals
app.get("/api/signals", async (req, res) => {
  const token = (req.query.token as string)?.trim().toLowerCase();
  const valid = await isTokenValid(token || '');
  
  if (!valid) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { symbol, type } = req.query; // type: 'crypto' or 'forex'
  
  // Simple signal generation logic
  // In a real app, this would use technical analysis libraries
  // Here we use a deterministic but changing signal based on time and symbol
  const generateSignal = (sym: string, timeframe: string) => {
    const now = Date.now();
    let intervalMs = 60000;
    if (timeframe === '5s') intervalMs = 5000;
    if (timeframe === '10s') intervalMs = 10000;
    if (timeframe === '1m') intervalMs = 60000;
    if (timeframe === '2m') intervalMs = 120000;
    if (timeframe === '3m') intervalMs = 180000;
    if (timeframe === '4m') intervalMs = 240000;
    if (timeframe === '5m') intervalMs = 300000;

    // Use a hash-like function to make it look "live" but consistent for the same timeframe window
    const seed = Math.floor(now / intervalMs);
    const hash = (sym.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + seed) % 2;
    return hash === 0 ? "Buy" : "Sell";
  };

  const timeframes = ["5s", "10s", "1m", "2m", "3m", "4m", "5m"];
  const signals: Record<string, string> = {};
  
  timeframes.forEach(tf => {
    signals[tf] = generateSignal(symbol as string, tf);
  });

  res.json({ symbol, signals });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
