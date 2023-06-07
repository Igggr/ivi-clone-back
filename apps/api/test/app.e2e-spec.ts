import {
  HttpStatus,
  INestApplication,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientProxy, ClientsModule } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ADD_ROLE,
  AUTH,
  CREATE_ROLE,
  FILM,
  PARSED_DATA,
  RABBIT_OPTIONS,
} from '@app/rabbit';
import {
  CreateGenreDTO,
  HttpExceptionFilter,
  UpdateGenreDto,
  User,
  CreateRoleDto,
  Role,
  AddRoleDto,
  Film,
  CreateFilmDTO,
  SomeGenresNotFound,
  SubmitReviewDTO,
} from '@app/shared';
import { ApiModule } from '../src/api.module';
import { RolesService } from '../../auth/src/roles/roles.service';
import { ADMIN, USER } from '../../../libs/shared/src/constants/role.const';
import { UsersService } from '../../auth/src/users/users.service';
import { crouchingTigerHiddenDragon } from './data';

type Token = { token: string };

@Injectable()
class ClientService {
  constructor(
    @Inject(AUTH) public readonly authClient: ClientProxy,
    @Inject(FILM) public readonly filmClient: ClientProxy,
  ) {}
}

describe('Test API', () => {
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

  const comedyDTO: CreateGenreDTO = {
    genreName: 'Комедия',
    genreNameEn: 'comedy',
  };
  const dramaDTO: CreateGenreDTO = { genreName: 'Драмма' };
  let comedyId: number;
  let dramaId: number;

  let crouchingTigerId: number;

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
        ClientsModule.register([
          {
            name: FILM,
            ...RABBIT_OPTIONS(FILM),
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

  describe('registration', () => {
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
          expect(r.body.error).toBe(
            'Пользователь с таким email уже существует',
          ),
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
      await makeAdmin(adminId ?? 1, clientService.authClient);

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
  });

  describe('roles', () => {
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
  });

  describe('genre', () => {
    it('POST /genre Admin can create new genre', () => {
      return request(app.getHttpServer())
        .post('/genre')
        .auth(adminToken.token, { type: 'bearer' })
        .send(comedyDTO)
        .expect(HttpStatus.CREATED)
        .then((r) => {
          expect(r.body).toEqual({
            status: 'ok',
            value: { url: null, ...comedyDTO, id: 1 },
          });
          comedyId = r.body.value.id;
        });
    }, 100000);

    it('POST /genre Admin can create new genre without specifying genreNameEn', () => {
      return request(app.getHttpServer())
        .post('/genre')
        .auth(adminToken.token, { type: 'bearer' })
        .send(dramaDTO)
        .expect(HttpStatus.CREATED)
        .then((r) => {
          expect(r.body).toEqual({
            status: 'ok',
            value: { url: null, ...dramaDTO, genreNameEn: null, id: 2 },
          });
          dramaId = r.body.value.id;
        });
    }, 100000);

    it('GET /genre Newly created genre saved in DB', () => {
      return request(app.getHttpServer())
        .get('/genre')
        .auth(adminToken.token, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then((r) =>
          expect(r.body).toEqual([
            {
              genreName: comedyDTO.genreName,
              genreNameEn: comedyDTO.genreNameEn,
              url: null,
              id: 1,
            },
            {
              genreName: dramaDTO.genreName,
              genreNameEn: null,
              url: null,
              id: 2,
            },
          ]),
        );
    });

    it('GET /genre/:id Can get genre by id', () => {
      return request(app.getHttpServer())
        .get(`/genre/${comedyId}`)
        .auth(adminToken.token, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then((r) =>
          expect(r.body).toEqual({
            url: null,
            ...comedyDTO,
            id: 1,
          }),
        );
    });

    it('PUT /genre Admin can update genre', () => {
      const payload: UpdateGenreDto = {
        id: dramaId,
        genreNameEn: 'Drama',
      };

      return request(app.getHttpServer())
        .put('/genre')
        .auth(adminToken.token, { type: 'bearer' })
        .send(payload)
        .expect(HttpStatus.OK)
        .then((r) =>
          expect(r.body).toEqual({
            status: 'ok',
            value: {
              url: null,
              ...dramaDTO,
              genreNameEn: payload.genreNameEn,
              id: dramaId,
            },
          }),
        );
    });

    it('DELETE /genre/:id Admin can delete genre', () => {
      return request(app.getHttpServer())
        .delete(`/genre/${comedyId}`)
        .auth(adminToken.token, { type: 'bearer' })
        .expect(HttpStatus.OK);
    });

    it('GET /genre/:id Deleted genre really deleted from DB', () => {
      return request(app.getHttpServer())
        .get(`/genre/${comedyId}`)
        .auth(adminToken.token, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then((r) => expect(r.body).toEqual({}));
    });
  });

  describe('film', () => {
    it(`Film will be created when ${PARSED_DATA} message is send`, async () => {
      const film: Film = await firstValueFrom(
        clientService.filmClient.send(
          { cmd: PARSED_DATA },
          crouchingTigerHiddenDragon,
        ),
      );

      expect(film.id).toBeDefined();
      crouchingTigerId = film.id;
    }, 100000);

    it('Can get film by id with all reviews and comments', () => {
      return request(app.getHttpServer())
        .get(`/film/${crouchingTigerId}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            id: crouchingTigerId,
            url: crouchingTigerHiddenDragon.url,
            preview: crouchingTigerHiddenDragon.preview,
            year: crouchingTigerHiddenDragon.year,
            title: crouchingTigerHiddenDragon.title,
            originalTitle: crouchingTigerHiddenDragon.originalTitle,
            slogan: crouchingTigerHiddenDragon.slogan,
            ageRestrictionId: 1,
            countryId: 1,
            duration: {
              hours: 2,
            },
          });

          expect(response.body.reviews.length).toEqual(
            crouchingTigerHiddenDragon.reviews.length,
          );

          crouchingTigerHiddenDragon.reviews.forEach((review) => {
            const responseReview = response.body.reviews.find(
              (r) => r.title === review.title && r.text === review.text,
            );
            expect(responseReview).toBeDefined();
            expect(responseReview.comments.length).toEqual(
              review.comments.length,
            );

            review.comments.forEach((comment) => {
              const responseComment = responseReview.comments.find(
                (c) => c.text === comment.text,
              );
              expect(responseComment).toBeDefined();
            });
          });
        });
    }, 100000);

    it("Can't create film if his genre doesn't exist", () => {
      const filmDto: CreateFilmDTO = {
        title: 'Терминатор',
        originalTitle: 'The Terminator',
        year: 1984,
        countryName: 'США',
        genreNames: ['фантастика', 'боевик', 'триллер'],
        slogan: '«Твоё будущее в его руках»',
        duration: '108 minutes',
      };
      return request(app.getHttpServer())
        .post(`/film`)
        .auth(adminToken.token, { type: 'bearer' })
        .send(filmDto)
        .then((r) => {
          expect(r.body).toEqual({
            error: SomeGenresNotFound,
            status: 'error',
          });
        });
    });

    it('Admin can create new film', async () => {
      // создадим недостающие жанры
      const fantasy: CreateGenreDTO = {
        genreName: 'фантастика',
        genreNameEn: 'fiction',
      };
      const thriller: CreateGenreDTO = {
        genreName: 'триллер',
        genreNameEn: 'thriller',
      };

      await request(app.getHttpServer())
        .post('/genre')
        .auth(adminToken.token, { type: 'bearer' })
        .send(fantasy);

      await request(app.getHttpServer())
        .post('/genre')
        .auth(adminToken.token, { type: 'bearer' })
        .send(thriller);

      const filmDto: CreateFilmDTO = {
        title: 'Терминатор',
        originalTitle: 'The Terminator',
        year: 1984,
        countryName: 'США',
        genreNames: ['фантастика', 'боевик', 'триллер'],
        slogan: '«Твоё будущее в его руках»',
        duration: '108 minutes',
      };
      return request(app.getHttpServer())
        .post(`/film`)
        .auth(adminToken.token, { type: 'bearer' })
        .send(filmDto)
        .expect(HttpStatus.CREATED)
        .then((r) => {
          expect(r.body).toEqual({
            status: 'ok',
            value: {
              year: 1984,
              title: 'Терминатор',
              originalTitle: 'The Terminator',
              slogan: '«Твоё будущее в его руках»',
              duration: '108 minutes',
              country: {
                id: 13,
                countryName: 'США',
                url: '/lists/m_act[country]/1/',
              },
              countryId: 13,
              url: null,
              preview: null,
              ageRestrictionId: null,
              id: 2,
            },
          });
        });
    });

    it('Can get films without limiting then by genre', () => {
      return request(app.getHttpServer())
        .get('/film')
        .expect(HttpStatus.OK)
        .then((r) => {
          expect(r.body.length).toBe(2);
          expect(r.body[0]).toMatchObject({
            title: crouchingTigerHiddenDragon.title,
          });
          expect(r.body[1]).toMatchObject({
            title: 'Терминатор',
          });
        });
    });

    it('Can filter films by genre', () => {
      return request(app.getHttpServer())
        .get('/film?genres=fiction,action')
        .expect(HttpStatus.OK)
        .then((r) => {
          expect(r.body.length).toBe(1);
          expect(r.body[0]).toMatchObject({
            title: 'Терминатор',
          });
        });
    });

    it('Can limit returned film number', () => {
      return request(app.getHttpServer())
        .get('/film?limit=1&ofset=0')
        .expect(HttpStatus.OK)
        .then((r) => {
          expect(r.body.length).toBe(1);
          expect(r.body[0]).toMatchObject({
            title: crouchingTigerHiddenDragon.title,
          });
        });
    });

    it('POST /film/review User can add review for film', () => {
      const review: SubmitReviewDTO = {
        title: 'Aaaaa',
        text: 'Да кто вобще так снимает-то? О чем фильм, непонтнооо :((',
        filmId: 1,
        isPositive: false,
      };

      return request(app.getHttpServer())
        .post('/film/review')
        .auth(simpleUserToken.token, { type: 'bearer' })
        .send(review)
        .expect(HttpStatus.CREATED)
        .then((r) => {
          expect(r.body).toMatchObject({
            filmId: review.filmId,
            isPositive: review.isPositive ?? null,
            profileId: simpleUserId, // потому что использовали его jwt-токен
            title: review.title,
            text: review.text,
          });
          expect(r.body.id).toBeDefined();
        });
    });
  });

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
