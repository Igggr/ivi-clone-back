import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({})
export class DatabaseModule {
  static forRoot(entities): DynamicModule[] {
    return [
      {
        module: DatabaseModule,
        imports: [
          TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
              type: 'postgres',
              host: configService.get<string>('DB_HOST'),
              port: +configService.get('DB_PORT'),
              username: configService.get<string>('POSTGRES_USER'),
              password: configService.get<string>('POSTGRES_PASSWORD'),
              database: configService.get<string>('POSTGRES_DB'),
              entities,
              synchronize: configService.get('NODE_ENV') !== 'prod' || true,
              autoLoadEntities: configService.get('NODE_ENV') !== 'prod' || true,
            }),
            inject: [ConfigService],
          }),

        ],
      },
      TypeOrmModule.forFeature(entities),
    ]
  }
}
