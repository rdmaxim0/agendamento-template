import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../lib/api'; 
import '../styles/auth.scss';

const registerSchema = z.object({
  name: z.string().min(2, 'O nome é obrigatório'),
  lastName: z.string().min(2, 'O sobrenome é obrigatório'),
  cpf: z.string().min(14, 'CPF incompleto'), 
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha precisa de no mínimo 6 caracteres'),
});

type RegisterData = z.infer<typeof registerSchema>;

// Função utilitária para aplicar a máscara do CPF no input
const cpfMask = (value: string) => {
  return value
    .replace(/\D/g, '') 
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1'); 
};

export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  async function handleRegister(data: RegisterData) {
    try {
      const cleanCpf = data.cpf.replace(/\D/g, '');
      const payload = { ...data, cpf: cleanCpf };

      await api.post('/auth/register', payload);
      toast.success('Conta criada com sucesso! Faça o login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar conta.');
    }
  }

  return (
    <main className="auth-container auth">
      <form onSubmit={handleSubmit(handleRegister)} className="auth__card">
        <h1>Criar Conta</h1>
        
        {/* Nome e Sobrenome agora em blocos separados com 100% de largura */}
        <label>
          Nome
          <input type="text" placeholder="Ex: Rodrigo" {...register('name')} />
          {errors.name && <span className="auth__error">{errors.name.message}</span>}
        </label>
        
        <label>
          Sobrenome
          <input type="text" placeholder="Ex: Máximo" {...register('lastName')} />
          {errors.lastName && <span className="auth__error">{errors.lastName.message}</span>}
        </label>

        <label>
          CPF
          <input 
            type="text" 
            placeholder="000.000.000-00" 
            {...register('cpf')} 
            onChange={(e) => {
              setValue('cpf', cpfMask(e.target.value), { shouldValidate: true });
            }}
          />
          {errors.cpf && <span className="auth__error">{errors.cpf.message}</span>}
        </label>

        <label>
          E-mail
          <input type="email" placeholder="voce@email.com" {...register('email')} />
          {errors.email && <span className="auth__error">{errors.email.message}</span>}
        </label>

        <label>
          Senha
          <input type="password" placeholder="Crie uma senha" {...register('password')} />
          {errors.password && <span className="auth__error">{errors.password.message}</span>}
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'A criar...' : 'Registar'}
        </button>

        <div className="auth__footer">
          <p>Já tem conta? <Link to="/login">Faça Login</Link></p>
        </div>
      </form>
    </main>
  );
}