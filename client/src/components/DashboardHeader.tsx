import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, AlertCircle } from "lucide-react";

interface DashboardHeaderProps {
  activeBotsCount: number;
  onEmergencyStop: () => void;
}

export function DashboardHeader({ activeBotsCount, onEmergencyStop }: DashboardHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-card-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              RSI Bot Yönetim Paneli
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Binance Futures botlarınızı yönetin
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge 
              variant={activeBotsCount > 0 ? "default" : "secondary"}
              className="px-3 py-1.5"
              data-testid="badge-active-bots"
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${activeBotsCount > 0 ? 'bg-success animate-pulse' : 'bg-status-stopped'}`} />
              {activeBotsCount} Aktif Bot
            </Badge>
            
            {activeBotsCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onEmergencyStop}
                data-testid="button-emergency-stop"
                className="gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Tümünü Durdur
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
