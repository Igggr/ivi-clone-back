import { RmqContext } from '@nestjs/microservices';

export function ack(context: RmqContext) {
  const channel = context.getChannelRef();
  const message = context.getMessage();
  channel.ack(message);
}
