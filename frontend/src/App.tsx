import { Outlet } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { Toaster } from 'sonner';
// Apague as importações antigas do <Header /> e <Footer /> se elas existirem aqui

export default function App() {
  return (
    <div className="app-container" style={{ paddingBottom: '80px', backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* O Header global sumiu. Vamos criar topos específicos por página para ficar igual ao seu print */}
      
      <main>
        <Outlet /> {/* Aqui renderizam as páginas (Home, Booking, etc.) */}
      </main>

      <BottomNav />
      <Toaster position="top-center" richColors />
    </div>
  );
}