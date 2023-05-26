import { HttpStatus, INestApplication, Inject, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ApiModule } from '../src/api.module';
import { HttpExceptionFilter, User } from '@app/shared';
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

type Token = { token: string };

@Injectable()
class ClientService{
  constructor(@Inject(AUTH) public readonly client: ClientProxy) { }  
}

describe('Registration', () => {
  let app: INestApplication;
  let clientService: ClientService;

  let adminToken: Token;
  let adminId: number;
  let simpleUserToken: Token;

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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ApiModule,
        ClientsModule.register([
          {
            name: AUTH,
            ...RABBIT_OPTIONS(AUTH),
          }]),
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
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    clientService = app.get<ClientService>(ClientService);
    await app.init();
  });

  it(`/POST registration: user can register`, () => {
    return request(app.getHttpServer())
      .post('/registration')
      .send(adminDTO)
      .expect(HttpStatus.CREATED)
      .then((r) => expect(r.body.token).toBeDefined());
  }, 100000);

  it(`/POST registration: only one user can register with email`, () => {
    return request(app.getHttpServer())
      .post('/registration')
      .send(adminDTO)
      .expect(HttpStatus.BAD_REQUEST)
      .then((r) =>
        expect(r.body.error).toBe('Пользователь с таким email уже существует'),
      );
  }, 100000);

  it(`/POST registration: other users can register as well`, () => {
    return request(app.getHttpServer())
      .post('/registration')
      .send(simpleUserDTO)
      .expect(HttpStatus.CREATED)
      .then((r) => {
        simpleUserToken = r.body.token;
        expect(r.body.token).toBeDefined();
      });
  }, 100000);

  it("/POST login: Admin can login", async () => {
    await makeAdmin(adminId, clientService.client);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminDTO.email,
        password: adminDTO.password
      })
      .expect(HttpStatus.CREATED)  // а почему CREATED - а не OK?
      .then((r) => {
        expect(r.body.profileInfo).toMatchObject({
          name: adminDTO.name,
          surname: adminDTO.surname,
          nickname: adminDTO.nickname,
        });
        expect(r.body.profileInfo.userId).toBeDefined();
        expect(r.body.token).toBeDefined();
        adminToken = r.body.token;
      });
  }, 100000);

  it("/POST login: User can login", () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: simpleUserDTO.email,
        password: simpleUserDTO.password
      })
      .expect(HttpStatus.CREATED)  // а почему CREATED - а не OK?
      .then((r) => {
        expect(r.body.profileInfo).toMatchObject({
          name: simpleUserDTO.name,
          surname: simpleUserDTO.surname,
          nickname: simpleUserDTO.nickname,
        });
        expect(r.body.profileInfo.userId).toBeDefined();
        expect(r.body.token).toBeDefined();
        simpleUserToken = r.body.token;
      });
  }, 100000);

  it("/GET roles: Should be forbidden to simple user", () => {
    return request(app.getHttpServer())
      .get('/auth/roles')
      .auth(simpleUserToken.token, { type: "bearer" })
      .expect(HttpStatus.FORBIDDEN)
      .then((r) => expect(r.body.error).toEqual('Forbidden resource'));
  }, 100000);

  it("/GET roles: Admin should be able to get roles", () => {
    return request(app.getHttpServer())
      .get('/auth/roles')
      .auth(adminToken.token, { type: "bearer" })
      .expect(HttpStatus.OK)
      .then((r) => expect(r.body).toEqual([
        { ...USER, id: 1 },
        { ...ADMIN, id: 2 },
      ]));
  }, 100000);

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