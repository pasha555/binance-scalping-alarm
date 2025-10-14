// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  blockedCoins;
  botStatuses;
  constructor() {
    this.blockedCoins = /* @__PURE__ */ new Map();
    this.botStatuses = /* @__PURE__ */ new Map();
  }
  async getBlockedCoins() {
    return Array.from(this.blockedCoins.values());
  }
  async addBlockedCoin(insertCoin) {
    const id = randomUUID();
    const coin = {
      id,
      symbol: insertCoin.symbol.toUpperCase(),
      createdAt: /* @__PURE__ */ new Date()
    };
    this.blockedCoins.set(coin.symbol, coin);
    return coin;
  }
  async removeBlockedCoin(symbol) {
    return this.blockedCoins.delete(symbol.toUpperCase());
  }
  async isBlockedCoin(symbol) {
    return this.blockedCoins.has(symbol.toUpperCase());
  }
  async getBotStatus(botName) {
    return this.botStatuses.get(botName);
  }
  async getAllBotStatuses() {
    return Array.from(this.botStatuses.values());
  }
  async updateBotStatus(botName, isRunning) {
    let status = this.botStatuses.get(botName);
    if (!status) {
      status = {
        id: randomUUID(),
        botName,
        isRunning,
        lastActive: isRunning ? /* @__PURE__ */ new Date() : null
      };
    } else {
      status = {
        ...status,
        isRunning,
        lastActive: isRunning ? /* @__PURE__ */ new Date() : status.lastActive
      };
    }
    this.botStatuses.set(botName, status);
    return status;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var blockedCoins = pgTable("blocked_coins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var botStatus = pgTable("bot_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botName: text("bot_name").notNull().unique(),
  isRunning: boolean("is_running").notNull().default(false),
  lastActive: timestamp("last_active")
});
var insertBlockedCoinSchema = createInsertSchema(blockedCoins).pick({
  symbol: true
});
var insertBotStatusSchema = createInsertSchema(botStatus).pick({
  botName: true,
  isRunning: true
});

// server/routes.ts
import { spawn } from "child_process";
import path from "path";
var botProcesses = /* @__PURE__ */ new Map();
async function registerRoutes(app2) {
  app2.get("/api/blocked-coins", async (req, res) => {
    try {
      const coins = await storage.getBlockedCoins();
      res.json(coins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blocked coins" });
    }
  });
  app2.post("/api/blocked-coins", async (req, res) => {
    try {
      const validated = insertBlockedCoinSchema.parse(req.body);
      const coin = await storage.addBlockedCoin(validated);
      res.json(coin);
    } catch (error) {
      res.status(400).json({ error: "Invalid coin data" });
    }
  });
  app2.delete("/api/blocked-coins/:symbol", async (req, res) => {
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
  app2.get("/api/blocked-coins/check/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const isBlocked = await storage.isBlockedCoin(symbol);
      res.json({ isBlocked });
    } catch (error) {
      res.status(500).json({ error: "Failed to check coin" });
    }
  });
  app2.get("/api/bots", async (req, res) => {
    try {
      const statuses = await storage.getAllBotStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot statuses" });
    }
  });
  app2.post("/api/bots/:botName/start", async (req, res) => {
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
  app2.post("/api/bots/:botName/stop", async (req, res) => {
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
  app2.post("/api/bots/stop-all", async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
