import Navbar from '@/components/layout/navbar';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default function DashboardPage() {
  return (
    <Navbar variant="landing" showBorder={true}>
      <main className="pt-16">
        <DashboardContent />
      </main>
    </Navbar>
  );
}
