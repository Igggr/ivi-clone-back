import { Transport } from '@nestjs/microservices';

export const RABBIT_OPTIONS = (name: string) => ({
  transport: Transport.RMQ as const,
  options: {
    urls: [
      'amqp://rabbit:5672',    // микросервис заппущен из контейнера
      'amqp://localhost:5672', // микросервис заппущен из командной строки
    ],
    queue: `${name}_queue`,
    queueOptions: {
      durable: true,
    },
    noAck: false,
  },
});
