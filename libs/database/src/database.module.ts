import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  DB_HOST,
  DB_PORT,
  DOCKER_CONTAINER,
  POSTGRES_DB,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
} from './keys';
import { DOCKER, FOR, NODE_ENV, PROD, TEST } from '@app/shared/constants/keys';

@Module({})
export class DatabaseModule {
  static forRoot(entities): DynamicModule[] {
    return [
      {
        module: DatabaseModule,
        imports: [
          TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => {
              if (configService.get<string>(FOR) === TEST) {
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
                  configService.get<string>(FOR) === DOCKER
                    ? configService.get<string>(DOCKER_CONTAINER)
                    : configService.get<string>(DB_HOST),
                port:
                  configService.get<string>(FOR) === DOCKER
                    ? 5432
                    : +configService.get(DB_PORT),
                username: configService.get<string>(POSTGRES_USER),
                password: configService.get<string>(POSTGRES_PASSWORD),
                database: configService.get<string>(POSTGRES_DB),
                entities,
                synchronize: configService.get<string>(NODE_ENV) !== PROD,
                autoLoadEntities: configService.get<string>(NODE_ENV) !== PROD,
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
