import { type BlockedCoin, type InsertBlockedCoin, type BotStatus, type InsertBotStatus } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Blocked Coins
  getBlockedCoins(): Promise<BlockedCoin[]>;
  addBlockedCoin(coin: InsertBlockedCoin): Promise<BlockedCoin>;
  removeBlockedCoin(symbol: string): Promise<boolean>;
  isBlockedCoin(symbol: string): Promise<boolean>;

  // Bot Status
  getBotStatus(botName: string): Promise<BotStatus | undefined>;
  getAllBotStatuses(): Promise<BotStatus[]>;
  updateBotStatus(botName: string, isRunning: boolean): Promise<BotStatus>;
}

export class MemStorage implements IStorage {
  private blockedCoins: Map<string, BlockedCoin>;
  private botStatuses: Map<string, BotStatus>;

  constructor() {
    this.blockedCoins = new Map();
    this.botStatuses = new Map();
  }

  async getBlockedCoins(): Promise<BlockedCoin[]> {
    return Array.from(this.blockedCoins.values());
  }

  async addBlockedCoin(insertCoin: InsertBlockedCoin): Promise<BlockedCoin> {
    const id = randomUUID();
    const coin: BlockedCoin = {
      id,
      symbol: insertCoin.symbol.toUpperCase(),
      createdAt: new Date(),
    };
    this.blockedCoins.set(coin.symbol, coin);
    return coin;
  }

  async removeBlockedCoin(symbol: string): Promise<boolean> {
    return this.blockedCoins.delete(symbol.toUpperCase());
  }

  async isBlockedCoin(symbol: string): Promise<boolean> {
    return this.blockedCoins.has(symbol.toUpperCase());
  }

  async getBotStatus(botName: string): Promise<BotStatus | undefined> {
    return this.botStatuses.get(botName);
  }

  async getAllBotStatuses(): Promise<BotStatus[]> {
    return Array.from(this.botStatuses.values());
  }

  async updateBotStatus(botName: string, isRunning: boolean): Promise<BotStatus> {
    let status = this.botStatuses.get(botName);
    
    if (!status) {
      status = {
        id: randomUUID(),
        botName,
        isRunning,
        lastActive: isRunning ? new Date() : null,
      };
    } else {
      status = {
        ...status,
        isRunning,
        lastActive: isRunning ? new Date() : status.lastActive,
      };
    }
    
    this.botStatuses.set(botName, status);
    return status;
  }
}

export const storage = new MemStorage();
