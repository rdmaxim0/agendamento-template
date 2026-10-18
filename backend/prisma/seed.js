import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 A iniciar o seed da base de dados...');
    // 1. Limpa os agendamentos PRIMEIRO para quebrar a trava de chave estrangeira
    await prisma.appointment.deleteMany();
    // 2. Em seguida, limpa os serviços com segurança
    await prisma.service.deleteMany();
    const services = [
        // ... resto do seu catálogo continua igual
        {
            name: 'Corte Degradê Premium',
            description: 'Corte na máquina com degradê navalhado, tesoura no topo e finalização profissional com pomada.',
            price: 45.00,
            duration: 45,
        },
        {
            name: 'Barboterapia',
            description: 'Alinhamento da barba com toalha quente, ozono, massagem facial e óleos essenciais.',
            price: 35.00,
            duration: 30,
        },
        {
            name: 'Combo VIP (Corte + Barba)',
            description: 'A experiência completa. Inclui o Corte Premium e a Barboterapia com um valor especial.',
            price: 70.00,
            duration: 75,
        },
        {
            name: 'Sobrancelha',
            description: 'Limpeza e alinhamento da sobrancelha na navalha.',
            price: 15.00,
            duration: 15,
        },
        {
            name: 'Corte Infantil',
            description: 'Corte para crianças até 12 anos, com paciência e muito estilo.',
            price: 40.00,
            duration: 30,
        },
        {
            name: 'Platinado / Luzes',
            description: 'Descoloração global ou luzes, com proteção dos fios e matização.',
            price: 120.00,
            duration: 120,
        }
    ];
    for (const service of services) {
        await prisma.service.create({
            data: service,
        });
    }
    console.log('Catálogo de Barbearia criado com sucesso!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map