import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../lib/getErrorMessage';
import '../styles/auth.scss';

// Regras de validação (rodam no navegador, antes de chamar a API)
const loginSchema = z.object({
  email: z.string().email('Digite um e-mail válido.'),
  password: z.string().min(1, 'Digite sua senha.'),
});

// O TypeScript descobre sozinho o formato { email: string; password: string }
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const {
    register, // liga cada input ao formulário
    handleSubmit, // valida antes de chamar a nossa função
    formState: { errors, isSubmitting }, // erros por campo e estado "enviando"
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    try {
      await signIn(data.email, data.password);
      toast.success('Login realizado com sucesso!');
      navigate(from); // vai para a página inicial
    } catch (error) {
      toast.error(getErrorMessage(error)); // ex: "Credenciais inválidas."
    }
  }

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={handleSubmit(onSubmit)}>
        <h1>Entrar</h1>

        <label>
          E-mail
          <input type="email" placeholder="voce@email.com" {...register('email')} />
          {errors.email && <span className="auth__error">{errors.email.message}</span>}
        </label>

        <label>
          Senha
          <input type="password" placeholder="Sua senha" {...register('password')} />
          {errors.password && <span className="auth__error">{errors.password.message}</span>}
        </label>

        {/* disabled evita clicar duas vezes enquanto a requisição está em andamento */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="auth__footer">
          Ainda não tem conta? <Link to="/register" state={location.state}>Cadastre-se</Link>
        </p>
      </form>
    </main>
  );
}