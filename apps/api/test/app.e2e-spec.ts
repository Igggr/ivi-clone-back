import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from 'supertest';
import { ApiModule } from "../src/api.module";
import { CreateUserProfileDto } from "@app/shared";
import { ConfigService } from "@nestjs/config";

describe('Registration', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [ApiModule,
                // AuthModule, ProfilesModule
            ],
        }).overrideProvider(ConfigService).useValue({
            get(key) {
                if (key === 'IS_TEST') {
                    return true;
            } 
        }})
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    it(`/POST registration`, () => {
        const dto: CreateUserProfileDto = {
            email: "firstuser@mail.com",
            password: '1111',
            name: 'Jack',
            surname: 'Kent',
            nickname: 'jackiee',
            country: 'Usa',
            city: 'Chickago',
            url: null,
            photo: null
        };
        return request(app.getHttpServer())
            .post('/registration')
            .send(dto)
            .expect(400)
            // .expect({
            //     status: 'ok',
            // })
            .then((r) => console.log(r));
    });

    afterAll(async () => {
        await app.close();
    });
});