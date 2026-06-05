import { Outlet } from 'react-router-dom';
import BottomNav from '@components/BottomNav';
import FloatingParticles from '@components/FloatingParticles';
import QuickRelief from '@components/QuickRelief';
import PageTransition from '@components/PageTransition';

function App() {
  return (
    <div className="app">
      <FloatingParticles />
      <PageTransition>
        <Outlet />
      </PageTransition>
      <BottomNav />
      <QuickRelief />
    </div>
  );
}

export default App;
