import { useState } from 'react';
import { CoinBlockManager } from '../CoinBlockManager';

export default function CoinBlockManagerExample() {
  const [blockedCoins, setBlockedCoins] = useState(['BTCUSDT', 'ETHUSDT', 'SOLUSDT']);

  return (
    <div className="p-8 bg-background">
      <div className="max-w-2xl">
        <CoinBlockManager
          blockedCoins={blockedCoins}
          onAddCoin={(coin) => {
            console.log('Coin eklendi:', coin);
            setBlockedCoins([...blockedCoins, coin]);
          }}
          onRemoveCoin={(coin) => {
            console.log('Coin kaldırıldı:', coin);
            setBlockedCoins(blockedCoins.filter(c => c !== coin));
          }}
        />
      </div>
    </div>
  );
}
