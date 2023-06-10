import { DOCKER, TEST } from '@app/shared/constants/keys';
import { Transport } from '@nestjs/microservices';

export const RABBIT_OPTIONS = (name: string, target: string) => {
  const host =
    target === TEST
      ? 'rabbit_test' // используется для тестов
      : target === DOCKER
      ? 'rabbit' // микросервис запущен из контейнера
      : 'localhost'; // микросервис запущен из командной строки

  return {
    transport: Transport.RMQ as const,
    options: {
      urls: [`amqp://${host}:5672`],
      queue: `${name}_queue`,
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  };
};
