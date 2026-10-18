import { MercadoPagoConfig, Payment } from 'mercadopago';

// Instância do cliente do Mercado Pago
// IMPORTANTE: Adicione MP_ACCESS_TOKEN="seu_token_aqui" no seu ficheiro .env
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN as string });
const payment = new Payment(client);

interface PixProps {
 amount: number;
  description: string;
  payerEmail: string;
  payerFirstName: string;
  payerLastName: string;
  payerCpf: string;       
  appointmentId: string;
}

// 1. Função para CRIAR o pagamento
export async function createPixPayment({ amount, description, payerEmail, payerFirstName, payerLastName, payerCpf, appointmentId }: PixProps) {
  try {
    const body = {
      transaction_amount: Number(amount), // Garante que o valor é estritamente numérico
      description: description,
      payment_method_id: 'pix',
      payer: {
        email: payerEmail, // Passa a usar o e-mail real do cliente
        first_name: payerFirstName,
        last_name: payerLastName,
        identification: {
          type: 'CPF',
          number: payerCpf.replace(/\D/g, '') // Mantemos um CPF genérico para evitar bloqueios da API
        }
      },
      external_reference: appointmentId,
    };

    // Passamos a Idempotency Key exigida pelo Mercado Pago usando o ID da reserva
    const response = await payment.create({
      body,
      requestOptions: {
        idempotencyKey: appointmentId
      }
    });

    return {
      paymentId: response.id?.toString() || "",
      status: response.status,
      statusDetail: response.status_detail,
      qrCode: response.point_of_interaction?.transaction_data?.qr_code || null,
      qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64 || null,
    };
  } catch (error: any) {
    console.error("\n=== RAIO-X DO ERRO DO MERCADO PAGO ===");
    console.error("Mensagem:", error.message);
    if (error.cause) {
      console.error("Causa (Array):", JSON.stringify(error.cause, null, 2));
    }
    if (error.response) {
      console.error("Resposta Raw:", JSON.stringify(error.response, null, 2));
    }
    console.error("======================================\n");
    
    throw new Error("Falha na comunicação com o Mercado Pago.");
  }
}

// 2. Função para CONSULTAR o pagamento (Polling)
export async function getPixPayment(paymentId: string) {
  try {
    const response = await payment.get({ id: paymentId });

    return {
      paymentId: response.id?.toString() || "",
      status: response.status,
      statusDetail: response.status_detail,
      // Aqui, quando o status mudar de 'processing' para 'pending', o QR Code já virá preenchido
      qrCode: response.point_of_interaction?.transaction_data?.qr_code || null,
      qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64 || null,
    };
  } catch (error) {
    console.error(`[PIX] Erro ao consultar pagamento ${paymentId}:`, error);
    throw new Error("Falha ao consultar status.");
  }
}