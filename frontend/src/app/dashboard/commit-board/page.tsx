import Navbar from '@/components/layout/navbar';
import CommitBoardPageContent from '@/components/dashboard/CommitBoardPageContent';

export default function CommitBoardPage() {
  return (
    <Navbar variant="landing" showBorder={true}>
      <main className="">
        <CommitBoardPageContent />
      </main>
    </Navbar>
  );
}
