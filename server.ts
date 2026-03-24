import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import axios from "axios";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

app.use(cors());
app.use(express.json());

// Helper to validate token against Supabase
const isTokenValid = async (token: string) => {
  if (token === "adminwaleed786") return true;
  
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', token)
      .single();
    
    if (error || !data) return false;
    
    const expiry = new Date(data.expires_at);
    return expiry.getTime() > Date.now();
  } catch (err) {
    console.error("Token validation error:", err);
    return false;
  }
};

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
