import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square } from "lucide-react";

interface BotControlCardProps {
  botName: string;
  interval: string;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  lastActive?: string;
}

export function BotControlCard({
  botName,
  interval,
  isRunning,
  onStart,
  onStop,
  lastActive,
}: BotControlCardProps) {
  return (
    <Card className={`relative ${isRunning ? 'border-l-4 border-l-primary' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-semibold flex items-center gap-3">
              <span className="font-mono">{botName}</span>
              <Badge 
                variant={isRunning ? "default" : "secondary"}
                className="font-medium"
                data-testid={`badge-status-${interval}`}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isRunning ? 'bg-success animate-pulse' : 'bg-status-stopped'}`} />
                {isRunning ? 'Çalışıyor' : 'Durduruldu'}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              {interval} aralıklı RSI tarama botu
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastActive && (
          <div className="text-sm text-muted-foreground">
            Son Aktivite: <span className="font-mono">{lastActive}</span>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            onClick={onStart}
            disabled={isRunning}
            className="flex-1"
            variant="default"
            data-testid={`button-start-${interval}`}
          >
            <Play className="mr-2 h-4 w-4" />
            Başlat
          </Button>
          <Button
            onClick={onStop}
            disabled={!isRunning}
            className="flex-1"
            variant="destructive"
            data-testid={`button-stop-${interval}`}
          >
            <Square className="mr-2 h-4 w-4" />
            Durdur
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
