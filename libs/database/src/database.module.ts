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
            useFactory: (configService: ConfigService) => {
              if (configService.get('IS_TEST')) {
                console.log('Test DB');
                return {
                  type: 'postgres',
                  host: 'postgres_test',
                  port: 5432,
                  username: 'test_user',
                  password: 'test_password',
                  database: 'test_db',
                  entities: entities,
                  synchronize: true,
                  autoLoadEntities: true,
                };
              }
              console.log('Normal DB');
              return {
                type: 'postgres',
                host:
                  configService.get<string>('FOR') === 'docker'
                    ? configService.get<string>('DOCKER_DB')
                    : configService.get<string>('DB_HOST'),
                port:
                  configService.get('FOR') === 'docker'
                    ? 5432
                    : +configService.get('DB_PORT'),
                username: configService.get<string>('POSTGRES_USER'),
                password: configService.get<string>('POSTGRES_PASSWORD'),
                database: configService.get<string>('POSTGRES_DB'),
                entities,
                synchronize: configService.get('NODE_ENV') !== 'prod' || true,
                autoLoadEntities:
                  configService.get('NODE_ENV') !== 'prod' || true,
              };
            },
            inject: [ConfigService],
          }),
        ],
      },
      TypeOrmModule.forFeature(entities),
    ];
  }
}
