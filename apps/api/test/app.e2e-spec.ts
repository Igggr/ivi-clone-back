import {
  HttpStatus,
  INestApplication,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ApiModule } from '../src/api.module';
import { CreateGenreDTO, HttpExceptionFilter, User } from '@app/shared';
import { RolesService } from '../../auth/src/roles/roles.service';
import { ADMIN, USER } from '../../../libs/shared/src/constants/role.const';
import { UsersService } from '../../auth/src/users/users.service';
import { Role } from '@app/shared/entities/role.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientProxy, ClientsModule } from '@nestjs/microservices';
import { ADD_ROLE, AUTH, CREATE_ROLE, RABBIT_OPTIONS } from '@app/rabbit';
import { AddRoleDto } from '@app/shared/dto/add-role.dto';
import { firstValueFrom } from 'rxjs';
import { CreateRoleDto } from '@app/shared/dto/create-role.dto';

type Token = { token: string };

@Injectable()
class ClientService {
  constructor(@Inject(AUTH) public readonly client: ClientProxy) {}
}

describe('Registration', () => {
  let app: INestApplication;
  let clientService: ClientService;

  let adminToken: Token;
  let adminId: number;
  let simpleUserToken: Token;
  let simpleUserId: number;

  const adminDTO = {
    name: 'first',
    surname: 'admin',
    nickname: 'pervonach',
    email: 'firstuser@mail.com',
    password: '1111',
  };

  const simpleUserDTO = {
    name: 'second',
    surname: 'simpleUser',
    nickname: 'vtoroy',
    email: 'seconduser@mail.com',
    password: '2222',
  };

  const testerRole: CreateRoleDto = {
    value: 'ALPHA_TESTER',
    description: 'На них проверяют работоспособность новой версии сайта',
  };

  const genreDTO: CreateGenreDTO = { genreName: 'Драмма' };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ApiModule,
        ClientsModule.register([
          {
            name: AUTH,
            ...RABBIT_OPTIONS(AUTH),
          },
        ]),
      ],
      providers: [
        RolesService,
        UsersService,
        ClientService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository<User>,
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository<Role>,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    clientService = app.get<ClientService>(ClientService);
    await app.init();
  });

  it(`/POST /registration: user can register`, () => {
    return request(app.getHttpServer())
      .post('/registration')
      .send(adminDTO)
      .expect(HttpStatus.CREATED)
      .then((r) => {
        expect(r.body.token).toBeDefined();
        expect(r.body.profileInfo).toMatchObject({
          name: adminDTO.name,
          surname: adminDTO.surname,
          nickname: adminDTO.nickname,
        });
        expect(r.body.profileInfo.userId).toBeDefined();
        adminId = r.body.profileInfo.userId;
      });
  }, 100000);

  it(`/POST /registration: only one user can register with email`, () => {
    return request(app.getHttpServer())
      .post('/registration')
      .send(adminDTO)
      .expect(HttpStatus.BAD_REQUEST)
      .then((r) =>
        expect(r.body.error).toBe('Пользователь с таким email уже существует'),
      );
  }, 100000);

  it(`/POST /registration: other users can register as well`, () => {
    return request(app.getHttpServer())
      .post('/registration')
      .send(simpleUserDTO)
      .expect(HttpStatus.CREATED)
      .then((r) => {
        expect(r.body.token).toBeDefined();
        simpleUserToken = r.body.token;

        expect(r.body.profileInfo).toMatchObject({
          name: simpleUserDTO.name,
          surname: simpleUserDTO.surname,
          nickname: simpleUserDTO.nickname,
        });
        expect(r.body.profileInfo.userId).toBeDefined();
        simpleUserId = r.body.profileInfo.userId;
      });
  }, 100000);

  it('/POST /auth/login: Admin can login', async () => {
    await makeAdmin(adminId ?? 1, clientService.client);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminDTO.email,
        password: adminDTO.password,
      })
      .expect(HttpStatus.CREATED) // а почему CREATED - а не OK?
      .then((r) => {
        expect(r.body.profileInfo).toMatchObject({
          name: adminDTO.name,
          surname: adminDTO.surname,
          nickname: adminDTO.nickname,
        });
        expect(r.body.profileInfo.userId).toBeDefined();
        adminId = r.body.profileInfo.userId;

        expect(r.body.token).toBeDefined();
        adminToken = r.body.token;
      });
  }, 100000);

  it('/POST /auth/login: User can login', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: simpleUserDTO.email,
        password: simpleUserDTO.password,
      })
      .expect(HttpStatus.CREATED) // а почему CREATED - а не OK?
      .then((r) => {
        expect(r.body.profileInfo).toMatchObject({
          name: simpleUserDTO.name,
          surname: simpleUserDTO.surname,
          nickname: simpleUserDTO.nickname,
        });
        expect(r.body.profileInfo.userId).toBeDefined();
        simpleUserId = r.body.profileInfo.userId;
        expect(r.body.token).toBeDefined();
        simpleUserToken = r.body.token;
      });
  }, 100000);

  it('/GET /auth/roles: Should be forbidden to simple user', () => {
    return request(app.getHttpServer())
      .get('/auth/roles')
      .auth(simpleUserToken.token, { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN)
      .then((r) => expect(r.body.error).toEqual('Forbidden resource'));
  }, 100000);

  it('/GET /auth/roles: Admin should be able to get roles', () => {
    return request(app.getHttpServer())
      .get('/auth/roles')
      .auth(adminToken.token, { type: 'bearer' })
      .expect(HttpStatus.OK)
      .then((r) =>
        expect(r.body).toEqual([
          { ...USER, id: 1 },
          { ...ADMIN, id: 2 },
        ]),
      );
  }, 100000);

  it('/POST /auth/roles: Admin should be able to add new role', () => {
    return request(app.getHttpServer())
      .post('/auth/roles')
      .auth(adminToken.token, { type: 'bearer' })
      .send(testerRole)
      .expect(HttpStatus.CREATED)
      .then((r) => expect(r.body).toEqual({ ...testerRole, id: 3 }));
  }, 100000);

  it('/GET /auth/roles: this new role should be saved in DB', () => {
    return request(app.getHttpServer())
      .get('/auth/roles')
      .auth(adminToken.token, { type: 'bearer' })
      .expect(HttpStatus.OK)
      .then((r) =>
        expect(r.body).toEqual([
          { ...USER, id: 1 },
          { ...ADMIN, id: 2 },
          { ...testerRole, id: 3 },
        ]),
      );
  }, 100000);

  it('/POST /auth/users/role: Admin should be able to assign role to other user', () => {
    const dto: AddRoleDto = { userId: simpleUserId, value: testerRole.value };
    return request(app.getHttpServer())
      .post('/auth/users/role')
      .auth(adminToken.token, { type: 'bearer' })
      .send(dto)
      .expect(HttpStatus.CREATED)
      .then((r) => {
        expect(r.body).toMatchObject({
          email: simpleUserDTO.email,
          id: dto.userId,
          roles: [
            { ...USER, id: 1 },
            { ...testerRole, id: 3 },
          ],
        });
        expect(r.body.password).toBeUndefined();
      });
  }, 100000);

  // it('POST /genre Admin can create new genres', () => {
  //   const dto: CreateGenreDTO = { genreName: 'Драмма'}
  //   return request(app.getHttpServer())
  //     .post('/genre')
  //     .auth(adminToken.token, { type: 'bearer' })
  //     .send(dto)
  //     .expect(HttpStatus.CREATED)
  //     .then((r) => expect(r.body).toEqual({ status: 'ok', value: { url: null, genreNameEn: null, ...dto, id: 1 } }));
  // })

  // it('GET /genre Newly created genres a saved in DB', () => {
  //   return request(app.getHttpServer())
  //     .get('/genre')
  //     .auth(adminToken.token, { type: 'bearer' })
  //     .expect(HttpStatus.OK)
  //     .then((r) => expect(r.body).toEqual({ ...genreDTO, id: 1 }));
  // });

  // it('DELETE /genre/1 Admin can delete genres', () => {
  //   return request(app.getHttpServer())
  //     .delete('/genre/1')
  //     .auth(adminToken.token, { type: 'bearer' })
  //     .expect(HttpStatus.GONE)
  //     .then((r) => expect(r.body).toEqual({ ...genreDTO, id: 1 }));
  // });

  afterAll(async () => {
    await app.close();
  });
});

async function makeAdmin(userId: number, client: ClientProxy) {
  await firstValueFrom(client.send({ cmd: CREATE_ROLE }, ADMIN));
  const addRoleDTO: AddRoleDto = {
    userId,
    value: ADMIN.value,
  };
  await firstValueFrom(client.send({ cmd: ADD_ROLE }, addRoleDTO));
}
