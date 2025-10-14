import { DashboardHeader } from '../DashboardHeader';

export default function DashboardHeaderExample() {
  return (
    <div className="bg-background min-h-screen">
      <DashboardHeader
        activeBotsCount={2}
        onEmergencyStop={() => console.log('Acil durdurma')}
      />
    </div>
  );
}
