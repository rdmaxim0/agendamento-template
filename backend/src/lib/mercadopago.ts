import { MercadoPagoConfig, Payment } from 'mercadopago';

// Configura o SDK do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
  options: { timeout: 10000 } 
});

const payment = new Payment(client);

interface PixData {
  amount: number;
  description: string;
  payerEmail: string;
  payerFirstName: string;
  payerLastName: string;
  payerCpf: string;
  appointmentId: string;
}

export async function createPixPayment(data: PixData) {
  try {
    const response = await payment.create({
      body: {
        transaction_amount: data.amount,
        description: data.description,
        payment_method_id: 'pix',
        payer: {
          email: data.payerEmail,
          first_name: data.payerFirstName || 'Cliente',
          last_name: data.payerLastName || 'GJRM',
          identification: {
            type: 'CPF',
            // O Mercado Pago em Produção pode recusar CPFs de teste mal formatados
            number: data.payerCpf ? data.payerCpf.replace(/\D/g, '') : '19119119100', 
          },
        },
        metadata: {
          appointment_id: data.appointmentId,
        },
      },
      requestOptions: {
        // Garantimos uma chave única para cada tentativa de Pix gerada
        idempotencyKey: `pix_${data.appointmentId}_${Date.now()}` 
      }
    });

    if (!response.point_of_interaction?.transaction_data) {
      console.error('[MP Error]: Resposta sem dados de transação:', JSON.stringify(response));
      throw new Error('Falha ao obter dados do Pix.');
    }

    const transactionData = response.point_of_interaction.transaction_data;

    return {
      paymentId: response.id!.toString(),
      qrCode: transactionData.qr_code!,
      qrCodeBase64: transactionData.qr_code_base64!,
    };
  } catch (error: any) {
    // ESTE CONSOLE VAI MOSTRAR O MOTIVO EXATO DA REJEIÇÃO NA ABA "LOGS" DO RENDER
    console.error('[PIX REJEITADO PELO MP]:', error.message || error);
    throw new Error('Não foi possível gerar o pagamento Pix.');
  }
}

export async function getPixPayment(paymentId: string) {
  try {
    const response = await payment.get({ id: paymentId });
    return {
      status: response.status,          
      detail: response.status_detail,
      amount: response.transaction_amount,
    };
  } catch (error) {
    console.error(`Erro ao consultar pagamento ${paymentId}:`, error);
    throw new Error('Não foi possível consultar o pagamento.');
  }
}