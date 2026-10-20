import { useState } from 'react';
import AdminAppointments from '../components/admin/AdminAppointments';
import AdminServices from '../components/admin/AdminServices';
import AdminProfessionals from '../components/admin/AdminProfessionals';
import '../styles/admin.scss';

type Tab = 'appointments' | 'services' | 'professionals';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('appointments');

  return (
    <main className="admin">
      <h1>Painel administrativo</h1>
      <div className="admin__tabs">
        <button type="button" className={tab === 'appointments' ? 'admin__tab admin__tab--active' : 'admin__tab'} onClick={() => setTab('appointments')}>Reservas</button>
        <button type="button" className={tab === 'services' ? 'admin__tab admin__tab--active' : 'admin__tab'} onClick={() => setTab('services')}>Serviços</button>
        <button type="button" className={tab === 'professionals' ? 'admin__tab admin__tab--active' : 'admin__tab'} onClick={() => setTab('professionals')}>Equipa</button>
      </div>

      {tab === 'appointments' && <AdminAppointments />}
      {tab === 'services' && <AdminServices />}
      {tab === 'professionals' && <AdminProfessionals />}
    </main>
  );
}