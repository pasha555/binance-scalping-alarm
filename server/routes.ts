import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBlockedCoinSchema } from "@shared/schema";
import { spawn, type ChildProcess } from "child_process";
import path from "path";

const botProcesses: Map<string, ChildProcess> = new Map();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all blocked coins
  app.get("/api/blocked-coins", async (req, res) => {
    try {
      const coins = await storage.getBlockedCoins();
      res.json(coins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blocked coins" });
    }
  });

  // Add blocked coin
  app.post("/api/blocked-coins", async (req, res) => {
    try {
      const validated = insertBlockedCoinSchema.parse(req.body);
      const coin = await storage.addBlockedCoin(validated);
      res.json(coin);
    } catch (error) {
      res.status(400).json({ error: "Invalid coin data" });
    }
  });

  // Remove blocked coin
  app.delete("/api/blocked-coins/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const removed = await storage.removeBlockedCoin(symbol);
      if (removed) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Coin not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to remove coin" });
    }
  });

  // Check if coin is blocked
  app.get("/api/blocked-coins/check/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const isBlocked = await storage.isBlockedCoin(symbol);
      res.json({ isBlocked });
    } catch (error) {
      res.status(500).json({ error: "Failed to check coin" });
    }
  });

  // Get all bot statuses
  app.get("/api/bots", async (req, res) => {
    try {
      const statuses = await storage.getAllBotStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot statuses" });
    }
  });

  // Start bot
  app.post("/api/bots/:botName/start", async (req, res) => {
    try {
      const { botName } = req.params;
      
      if (botProcesses.has(botName)) {
        return res.status(400).json({ error: "Bot already running" });
      }

      let scriptPath = "";
      if (botName === "1m") {
        scriptPath = path.join(process.cwd(), "bots", "bot_1m.py");
      } else if (botName === "5m") {
        scriptPath = path.join(process.cwd(), "bots", "bot_5m.py");
      } else if (botName === "funding") {
        scriptPath = path.join(process.cwd(), "bots", "bot_funding.py");
      } else {
        return res.status(400).json({ error: "Invalid bot name" });
      }

      const botProcess = spawn("python3", [scriptPath]);
      
      botProcess.stdout.on("data", (data) => {
        console.log(`[${botName}] ${data.toString()}`);
      });

      botProcess.stderr.on("data", (data) => {
        console.error(`[${botName}] ERROR: ${data.toString()}`);
      });

      botProcess.on("close", (code) => {
        console.log(`[${botName}] Process exited with code ${code}`);
        botProcesses.delete(botName);
        storage.updateBotStatus(botName, false);
      });

      botProcesses.set(botName, botProcess);
      const status = await storage.updateBotStatus(botName, true);
      
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to start bot" });
    }
  });

  // Stop bot
  app.post("/api/bots/:botName/stop", async (req, res) => {
    try {
      const { botName } = req.params;
      const botProcess = botProcesses.get(botName);
      
      if (!botProcess) {
        return res.status(400).json({ error: "Bot not running" });
      }

      botProcess.kill();
      botProcesses.delete(botName);
      const status = await storage.updateBotStatus(botName, false);
      
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to stop bot" });
    }
  });

  // Stop all bots
  app.post("/api/bots/stop-all", async (req, res) => {
    try {
      const entries = Array.from(botProcesses.entries());
      for (const [botName, botProcess] of entries) {
        botProcess.kill();
        await storage.updateBotStatus(botName, false);
      }
      botProcesses.clear();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to stop all bots" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
