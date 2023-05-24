import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from 'supertest';
import { ApiModule } from "../src/api.module";
import { HttpExceptionFilter } from "@app/shared";

describe('Registration', () => {
    let app: INestApplication;

    const firstUserDTO = {
        name: 'first',
        surname: 'user',
        nickname: 'pervonach',
        email: "firstuser@mail.com",
        password: '1111',
    };

    const secondUserDTO = {
        name: 'second',
        surname: 'user',
        nickname: 'vtoroy',
        email: "seconduser@mail.com",
        password: '2222',
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [ApiModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalFilters(new HttpExceptionFilter());
        await app.init();
    });

    it(`/POST registration: user can register`, () => {
        return request(app.getHttpServer())
            .post('/registration')
            .send(firstUserDTO)
            .expect(HttpStatus.CREATED)
            .then((r) => expect(r.body.token).toBeDefined());
    }, 100000);

    it(`/POST registration: only one user can register with email`, () => {
        return request(app.getHttpServer())
            .post('/registration')
            .send(firstUserDTO)
            .expect(HttpStatus.BAD_REQUEST)
            .then((r) => expect(r.body.error).toBe("Пользователь с таким email уже существует"));
    }, 100000);

    it(`/POST registration: other users can register as well`, () => {
        return request(app.getHttpServer())
            .post('/registration')
            .send(secondUserDTO)
            .expect(HttpStatus.CREATED)
            .then((r) => expect(r.body.token).toBeDefined());
    }, 100000);


    afterAll(async () => {
        await app.close();
    });
});