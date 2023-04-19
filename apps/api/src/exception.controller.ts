// import { THROW_HTTP_EXCEPTION, THROW_UNAUTH_EXCEPTION } from '@app/shared';
// import {
//   Controller,
//   HttpException,
//   HttpStatus,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';

// @Controller()
// export class ExceptionController {
//   @MessagePattern({ cmd: THROW_HTTP_EXCEPTION })
//   httpException(exceptionMessage: string, @Ctx() context: RmqContext) {
//     console.log(exceptionMessage);
//     const channel = context.getChannelRef();
//     const message = context.getMessage();
//     channel.ack(message);

//     throw new HttpException(exceptionMessage, HttpStatus.BAD_REQUEST);
//   }

//   @MessagePattern({ cmd: THROW_UNAUTH_EXCEPTION })
//   unauthorizedException(exceptionMessage: string, @Ctx() context: RmqContext) {
//     const channel = context.getChannelRef();
//     const message = context.getMessage();
//     channel.ack(message);

//     throw new UnauthorizedException(exceptionMessage);
//   }
// }
