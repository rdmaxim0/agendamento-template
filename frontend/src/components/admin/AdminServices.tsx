import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useServices } from '../../hooks/useServices';
import {
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '../../hooks/useServiceMutations';
import { getErrorMessage } from '../../lib/getErrorMessage';
import type { Service } from '../../types';

// Mesmas regras do backend, para o erro aparecer antes de chamar a API
const serviceSchema = z.object({
  name: z.string().min(2, 'Informe o nome do serviço.'),
  description: z.string().optional(),
  price: z.number().positive('O preço deve ser maior que zero.'),
  duration: z.number().int('Use minutos inteiros.').positive('A duração deve ser maior que zero.'),
});

type ServiceForm = z.infer<typeof serviceSchema>;

export default function AdminServices() {
  const { data: services } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  // Guarda qual serviço está sendo editado (null = formulário em modo "criar")
  const [editing, setEditing] = useState<Service | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceForm>({ resolver: zodResolver(serviceSchema) });

  // Limpa o formulário e volta para o modo "criar"
  function clearForm() {
    setEditing(null);
    reset({ name: '', description: '', price: undefined, duration: undefined });
  }

  // Preenche o formulário com os dados do serviço escolhido
  function startEdit(service: Service) {
    setEditing(service);
    reset({
      name: service.name,
      description: service.description ?? '',
      price: service.price,
      duration: service.duration,
    });
  }

  function onSubmit(data: ServiceForm) {
    if (editing) {
      updateService.mutate(
        { id: editing.id, data: { ...data, description: data.description ?? '' } },
        {
          onSuccess: () => {
            toast.success('Serviço atualizado!');
            clearForm();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        }
      );
      return;
    }

    createService.mutate(
      {
        name: data.name,
        price: data.price,
        duration: data.duration,
        // Só envia a descrição se foi preenchida
        ...(data.description ? { description: data.description } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Serviço criado!');
          clearForm();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  }

  function handleDelete(service: Service) {
    if (!window.confirm(`Remover "${service.name}"?`)) return;

    deleteService.mutate(service.id, {
      onSuccess: () => toast.success('Serviço removido.'),
      // Se o serviço tiver reservas, a API devolve 409 e a mensagem aparece aqui
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <section className="admin__section">
      <form className="admin__form" onSubmit={handleSubmit(onSubmit)}>
        <h2>{editing ? `Editando: ${editing.name}` : 'Novo serviço'}</h2>

        <label>
          Nome
          <input type="text" {...register('name')} />
          {errors.name && <span className="admin__error">{errors.name.message}</span>}
        </label>

        <label>
          Descrição (opcional)
          <input type="text" {...register('description')} />
        </label>

        <div className="admin__row">
          <label>
            Preço (R$)
            {/* valueAsNumber converte o texto do input em número antes de validar */}
            <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
            {errors.price && <span className="admin__error">{errors.price.message}</span>}
          </label>

          <label>
            Duração (min)
            <input type="number" {...register('duration', { valueAsNumber: true })} />
            {errors.duration && <span className="admin__error">{errors.duration.message}</span>}
          </label>
        </div>

        <div className="admin__actions">
          <button type="submit" disabled={isSubmitting}>
            {editing ? 'Salvar alterações' : 'Adicionar serviço'}
          </button>

          {editing && (
            <button type="button" className="admin__danger" onClick={clearForm}>
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      {services?.map((service) => (
        <div key={service.id} className="admin__card">
          <div className="admin__info">
            <strong>{service.name}</strong>
            <span>
              {service.duration} min ·{' '}
              {service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="admin__actions">
            <button type="button" onClick={() => startEdit(service)}>
              Editar
            </button>
            <button type="button" className="admin__danger" onClick={() => handleDelete(service)}>
              Remover
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}