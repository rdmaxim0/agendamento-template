// Formato de um serviço, igual ao que o backend devolve em GET /api/services
export interface Service {
    id: string;
    name: string;
    description: string | null; // no banco é opcional, então pode vir null
    price: number;
    duration: number; // em minutos
    imageUrl: string | null;
}

// NOVO: Profissional para o painel de administração
export interface Professional {
  id: string;
  name: string;
  isActive: boolean;
  imageUrl: string | null;
}

// Usuário que a API devolve no login (sem a senha, claro)
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

// Resposta completa de POST /api/auth/login
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Um horário livre, como a API devolve em GET /appointments/available
export interface Slot {
  startTime: string; // ISO completo, enviado de volta no POST
  label: string; // "09:30", para mostrar na tela
}

export interface AvailableResponse {
  date: string;
  service: string;
  slots: Slot[];
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

// Reserva como devolvida por GET /api/appointments/me
export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  service: {
    name: string;
    price: number;
    duration: number;
  };
  // NOVO: Adicionado para listar o profissional na tela do cliente
  professional?: {
    name: string;
  } | null;
}

// Reserva como o ADMIN a recebe (GET /api/appointments): traz os dados do cliente
export interface AdminAppointment {
  id: string;
  startTime: string;
  endTime: string;
  createdAt: string; 
  status: AppointmentStatus;
  paymentMethod: string; // "PIX" ou "MANUAL"
  customerName: string | null; // preenchido só nas reservas manuais
  customerPhone: string | null;
  user: { name: string; email: string; phone: string | null };
  service: { name: string; price: number };
  // NOVO: Adicionado para mostrar na agenda do Admin
  professional?: { 
    name: string; 
  } | null;
}

// Dados enviados ao criar ou editar um serviço
export interface ServicePayload {
  name: string;
  description?: string;
  price: number;
  duration: number;
}