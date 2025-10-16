import Navbar from '@/components/layout/navbar';
import Hero from '@/components/landingpage/hero';

export default function Home() {
  return (
    <Navbar variant="landing" showBorder={true}>
      <Hero />
    </Navbar>
  );
}
