import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BotControlCard } from "@/components/BotControlCard";
import { CoinBlockManager } from "@/components/CoinBlockManager";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface BlockedCoin {
  id: string;
  symbol: string;
  createdAt: string;
}

interface BotStatus {
  id: string;
  botName: string;
  isRunning: boolean;
  lastActive: string | null;
}

export default function Dashboard() {
  const { toast } = useToast();

  // Fetch blocked coins
  const { data: blockedCoins = [] } = useQuery<BlockedCoin[]>({
    queryKey: ['/api/blocked-coins'],
  });

  // Fetch bot statuses
  const { data: botStatuses = [] } = useQuery<BotStatus[]>({
    queryKey: ['/api/bots'],
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  const getBotStatus = (botName: string) => {
    return botStatuses.find(b => b.botName === botName);
  };

  const bot1m = getBotStatus('1m');
  const bot5m = getBotStatus('5m');
  const botFunding = getBotStatus('funding');

  const activeBotsCount = botStatuses.filter(b => b.isRunning).length;

  // Start bot mutation
  const startBotMutation = useMutation({
    mutationFn: async (botName: string) => {
      return apiRequest('POST', `/api/bots/${botName}/start`);
    },
    onSuccess: (_, botName) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      const botNames: Record<string, string> = {
        '1m': '1 Dakikalık',
        '5m': '5 Dakikalık',
        'funding': 'Funding Rate'
      };
      toast({
        title: "Bot Başlatıldı",
        description: `${botNames[botName]} bot çalışmaya başladı`,
      });
    },
    onError: (_, botName) => {
      toast({
        title: "Hata",
        description: `${botName} bot başlatılamadı`,
        variant: "destructive",
      });
    },
  });

  // Stop bot mutation
  const stopBotMutation = useMutation({
    mutationFn: async (botName: string) => {
      return apiRequest('POST', `/api/bots/${botName}/stop`);
    },
    onSuccess: (_, botName) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      const botNames: Record<string, string> = {
        '1m': '1 Dakikalık',
        '5m': '5 Dakikalık',
        'funding': 'Funding Rate'
      };
      toast({
        title: "Bot Durduruldu",
        description: `${botNames[botName]} bot durduruldu`,
        variant: "destructive",
      });
    },
  });

  // Stop all bots mutation
  const stopAllBotsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/bots/stop-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      toast({
        title: "Tüm Botlar Durduruldu",
        description: "Acil durdurma işlemi tamamlandı",
        variant: "destructive",
      });
    },
  });

  // Add blocked coin mutation
  const addCoinMutation = useMutation({
    mutationFn: async (symbol: string) => {
      return apiRequest('POST', '/api/blocked-coins', { symbol });
    },
    onSuccess: (_, symbol) => {
      queryClient.invalidateQueries({ queryKey: ['/api/blocked-coins'] });
      toast({
        title: "Coin Engellendi",
        description: `${symbol} tüm botlarda engellenecek`,
      });
    },
  });

  // Remove blocked coin mutation
  const removeCoinMutation = useMutation({
    mutationFn: async (symbol: string) => {
      return apiRequest('DELETE', `/api/blocked-coins/${symbol}`);
    },
    onSuccess: (_, symbol) => {
      queryClient.invalidateQueries({ queryKey: ['/api/blocked-coins'] });
      toast({
        title: "Engel Kaldırıldı",
        description: `${symbol} artık engellenmiyor`,
      });
    },
  });

  const formatLastActive = (lastActive: string | null | undefined) => {
    if (!lastActive) return undefined;
    return new Date(lastActive).toLocaleTimeString('tr-TR');
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        activeBotsCount={activeBotsCount}
        onEmergencyStop={() => stopAllBotsMutation.mutate()}
      />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Bot Kontrolleri</h2>
              <div className="space-y-4">
                <BotControlCard
                  botName="1 Dakikalık Bot"
                  interval="1m"
                  isRunning={bot1m?.isRunning || false}
                  onStart={() => startBotMutation.mutate('1m')}
                  onStop={() => stopBotMutation.mutate('1m')}
                  lastActive={formatLastActive(bot1m?.lastActive)}
                />
                <BotControlCard
                  botName="5 Dakikalık Bot"
                  interval="5m"
                  isRunning={bot5m?.isRunning || false}
                  onStart={() => startBotMutation.mutate('5m')}
                  onStop={() => stopBotMutation.mutate('5m')}
                  lastActive={formatLastActive(bot5m?.lastActive)}
                />
                <BotControlCard
                  botName="Funding Rate Bot"
                  interval="funding"
                  isRunning={botFunding?.isRunning || false}
                  onStart={() => startBotMutation.mutate('funding')}
                  onStop={() => stopBotMutation.mutate('funding')}
                  lastActive={formatLastActive(botFunding?.lastActive)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Coin Yönetimi</h2>
              <CoinBlockManager
                blockedCoins={blockedCoins.map(c => c.symbol)}
                onAddCoin={(coin) => addCoinMutation.mutate(coin)}
                onRemoveCoin={(coin) => removeCoinMutation.mutate(coin)}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-card rounded-lg border border-card-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Bağlantı Durumu: Aktif</span>
            <span className="mx-2">•</span>
            <span>Son Senkronizasyon: {new Date().toLocaleTimeString('tr-TR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
