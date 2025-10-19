import { JoinUs } from './join-us';

export function FooterSimple() {
  return (
    <footer className="bg-[#F5F1E8] border-t border-black/10 py-16">
      <div className="container mx-auto px-6">
        <JoinUs titleSize="medium" />
      </div>
    </footer>
  );
}

