import { BotControlCard } from '../BotControlCard';

export default function BotControlCardExample() {
  return (
    <div className="p-8 bg-background">
      <div className="max-w-md">
        <BotControlCard
          botName="1 Dakikalık Bot"
          interval="1m"
          isRunning={true}
          onStart={() => console.log('Bot başlatıldı')}
          onStop={() => console.log('Bot durduruldu')}
          lastActive="15:34:22"
        />
      </div>
    </div>
  );
}
