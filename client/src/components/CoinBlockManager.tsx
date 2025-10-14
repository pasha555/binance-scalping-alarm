import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Ban } from "lucide-react";

interface CoinBlockManagerProps {
  blockedCoins: string[];
  onAddCoin: (coin: string) => void;
  onRemoveCoin: (coin: string) => void;
}

export function CoinBlockManager({
  blockedCoins,
  onAddCoin,
  onRemoveCoin,
}: CoinBlockManagerProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      const formattedCoin = inputValue.trim().toUpperCase();
      if (!blockedCoins.includes(formattedCoin)) {
        onAddCoin(formattedCoin);
        setInputValue("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Ban className="h-5 w-5" />
          Coin Engelleme
        </CardTitle>
        <CardDescription>
          Telegram'a gönderilmesini engellemek istediğiniz coinleri ekleyin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Örn: BTCUSDT"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            className="font-mono"
            data-testid="input-coin-symbol"
          />
          <Button 
            onClick={handleAdd}
            data-testid="button-add-coin"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ekle
          </Button>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">
            Engellenen Coinler ({blockedCoins.length})
          </div>
          
          {blockedCoins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ban className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Henüz engellenmiş coin yok</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {blockedCoins.map((coin) => (
                <Badge
                  key={coin}
                  variant="secondary"
                  className="pl-3 pr-1 py-1 gap-2 bg-status-blocked/20 hover-elevate"
                  data-testid={`badge-blocked-${coin}`}
                >
                  <span className="font-mono font-medium">{coin}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-destructive/20"
                    onClick={() => onRemoveCoin(coin)}
                    data-testid={`button-remove-${coin}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
