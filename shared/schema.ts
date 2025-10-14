import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const blockedCoins = pgTable("blocked_coins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const botStatus = pgTable("bot_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botName: text("bot_name").notNull().unique(),
  isRunning: boolean("is_running").notNull().default(false),
  lastActive: timestamp("last_active"),
});

export const insertBlockedCoinSchema = createInsertSchema(blockedCoins).pick({
  symbol: true,
});

export const insertBotStatusSchema = createInsertSchema(botStatus).pick({
  botName: true,
  isRunning: true,
});

export type InsertBlockedCoin = z.infer<typeof insertBlockedCoinSchema>;
export type BlockedCoin = typeof blockedCoins.$inferSelect;
export type BotStatus = typeof botStatus.$inferSelect;
export type InsertBotStatus = z.infer<typeof insertBotStatusSchema>;
