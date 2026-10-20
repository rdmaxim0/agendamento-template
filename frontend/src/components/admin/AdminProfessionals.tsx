import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminProfessionals } from '../../hooks/useProfessionals';
import { api } from '../../lib/api';

export default function AdminProfessionals() {
  const { data: professionals, isLoading, refetch } = useAdminProfessionals();
  const [newProfName, setNewProfName] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newProfName.trim()) return;
    try {
      await api.post('/professionals', { name: newProfName });
      toast.success('Especialista adicionado à equipa!');
      setNewProfName('');
      refetch();
    } catch {
      toast.error('Erro ao adicionar especialista.');
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      await api.patch(`/professionals/${id}`, { isActive: !currentStatus });
      toast.success(currentStatus ? 'Profissional inativado.' : 'Profissional reativado.');
      refetch();
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  }

  if (isLoading) return <p>A carregar equipa...</p>;

  return (
    <section className="admin__section">
      <form onSubmit={handleCreate} className="admin__filter" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '24px' }}>
        <label style={{ flex: 1 }}>
          Nome do novo especialista
          <input 
            type="text" 
            value={newProfName} 
            onChange={(e) => setNewProfName(e.target.value)} 
            placeholder="Ex: Ana Silva" 
            style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid var(--color-line-strong)' }}
          />
        </label>
        <button type="submit" className="btn btn--primary" style={{ padding: '10px 20px', borderRadius: '8px' }}>
          Adicionar
        </button>
      </form>

      {professionals?.length === 0 && <p className="admin__empty">Nenhum profissional cadastrado.</p>}

      {professionals?.map((prof) => (
        <div key={prof.id} className="admin__card" style={{ opacity: prof.isActive ? 1 : 0.6, borderLeft: prof.isActive ? '4px solid var(--color-success)' : '4px solid var(--color-danger)' }}>
          <div className="admin__info">
            <strong style={{ fontSize: '1.2rem' }}>{prof.name}</strong>
            <span>{prof.isActive ? 'Status: A receber clientes' : 'Status: Ausente / Férias'}</span>
          </div>
          <div className="admin__actions">
            <button 
              type="button" 
              className={prof.isActive ? 'admin__danger' : ''} 
              onClick={() => toggleActive(prof.id, prof.isActive)}
            >
              {prof.isActive ? 'Inativar Profissional' : 'Reativar Profissional'}
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}