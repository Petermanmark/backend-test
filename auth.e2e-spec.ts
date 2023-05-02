import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let server: request.SuperTest<request.Test>;
    let jwt: string;
    let testMail: string;
    let testPwd: string;


    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        server = request(app.getHttpServer());
    });

    afterAll(async () => {
        await app.close();
    });

    testMail = 'auth1@test.com';
    testPwd = 'asd';

    it('Post /auth/signup (201)', async () => {
        const response = await server.post('/auth/signup')
        .send({ email: testMail, password: testPwd });
        expect(response.statusCode).toEqual(HttpStatus.CREATED);
    })

    it('POST /auth/signup (409)', async () => {
        const response = await server.post('/auth/signup')
        .send({ email: testMail, password: testPwd });
        expect(response.statusCode).toEqual(HttpStatus.CONFLICT);
    });

    it('POST /auth/login (200)', async () => {
        const response = await server.post('/auth/login')
        .send({ email: testMail, password: testPwd });
        jwt = response.body.access_token as string;
        expect(response.statusCode).toEqual(HttpStatus.OK);
    })

    it('POST /auth/login (401)', async () => {
        const response = await server.post('/auth/login')
        .send({ email: "not@email.com", password: "suspwd" });
        expect(response.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    })

    it('GET /profile (200)', async () => {
        const response = await server.get('/profile').set('Authorization', 'Bearer ' + jwt);
        expect(response.statusCode).toEqual(HttpStatus.OK)
    })
});