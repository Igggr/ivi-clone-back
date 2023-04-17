// import { DynamicModule, Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { ClientProxyFactory, Transport } from '@nestjs/microservices';
// import { SharedService } from '../shared.service';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//       envFilePath: './.env',
//     }),
//   ],
//   providers: [SharedService],
//   exports: [SharedService],
// })
// export class SharedModule {
//   static registerRmq(service: string, queue: string): DynamicModule {
//     const providers = [
//       {
//         provide: service,
//         useFactory: (configService: ConfigService) => {
//           const URL = configService.get('RABBITMQ_URL');

//           return ClientProxyFactory.create({
//             transport: Transport.RMQ,
//             options: {
//               urls: [`${URL}`],
//               queue,
//               queueOptions: {
//                 durable: true,
//               },
//             },
//           });
//         },
//         inject: [ConfigService],
//       },
//     ];

//     return {
//       module: SharedModule,
//       providers,
//       exports: providers,
//     };
//   }
// }
