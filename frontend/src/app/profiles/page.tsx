import Navbar from '@/components/layout/navbar';
import { ProfileContent } from '@/components/profile/ProfileContent';

export default function ProfilePage() {
  return (
    <Navbar variant="landing" showBorder={true}>
      <main className="pt-16">
        <ProfileContent />
      </main>
    </Navbar>
  );
}
