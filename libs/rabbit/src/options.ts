import { Transport } from '@nestjs/microservices';

export const RABIT_OPTIONS = (name: string) => ({
  transport: Transport.RMQ as const,
  options: {
    urls: ['amqp://localhost:5672'],
    // urls: ['amqp://rabbit:5672'],
    queue: `${name}_queue`,
    queueOptions: {
      durable: false,
    },
    noAck: false
  },
});
