import { Transport } from '@nestjs/microservices';

export const RABBIT_OPTIONS = (name: string) => ({
  transport: Transport.RMQ as const,
  options: {
    urls: ['amqp://localhost:5672'],
    queue: `${name}_queue`,
    queueOptions: {
      durable: true,
    },
    noAck: false,
  },
});
