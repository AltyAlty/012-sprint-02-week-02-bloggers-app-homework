import 'dotenv/config';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { generateBasicAuthToken } from '../../utils/auth/generate-admin-auth-token';
import { runDB, stopDb } from '../../../src/db/mongodb/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import { clearDb } from '../../utils/db/clear-db';
import request from 'supertest';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { createUser } from '../../utils/users/create-user';
import { getCreateUserInputDTO } from '../../utils/users/get-create-user-input-dto';
import { loginUser } from '../../utils/auth/login-user';
import { jwtService } from '../../../src/auth/adapters/jwt.service';
import { usersService } from '../../../src/users/application/users.service';

describe('Auth API validation', () => {
  const app = express();
  setupApp(app);
  const adminToken = generateBasicAuthToken();

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL, SETTINGS.TEST_DB_NAME);
    await clearDb(app);
  });

  beforeEach(async () => await clearDb(app));

  afterAll(async () => {
    await clearDb(app);
    await stopDb();
  });

  it('❌ 001 should not authenticate a user when incorrect body passed; POST /api/auth/login', async () => {
    const credentials01 = { login: 'user01', password: 'password123', email: 'user01@example.com' };
    const credentials02 = { login: 'tim01', password: 'password456', email: 'user02@example.ru' };
    await Promise.all([createUser(app, credentials01), createUser(app, credentials02)]);

    const incorrectLoginOrEmail1 = '';
    const incorrectLoginOrEmail2 = '    ';
    const incorrectLoginOrEmail3 = null;

    const incorrectPassword1 = '1';
    const incorrectPassword2 = '012345678900123456789000000';
    const incorrectPassword3 = '';
    const incorrectPassword4 = '   ';
    const incorrectPassword5 = null;

    const checkUserAuthentication = async (
      loginOrEmail: string | null,
      password: string | null,
      status: HttpStatuses
    ) => {
      await request(app).post(`${SETTINGS.AUTH_PATH}/login`).send({ loginOrEmail, password }).expect(status);
    };

    await checkUserAuthentication(incorrectLoginOrEmail1, credentials01.password, HttpStatuses.BadRequest_400);
    await checkUserAuthentication(incorrectLoginOrEmail2, credentials01.password, HttpStatuses.BadRequest_400);
    await checkUserAuthentication(incorrectLoginOrEmail3, credentials01.password, HttpStatuses.BadRequest_400);
    await checkUserAuthentication(credentials01.login, incorrectPassword1, HttpStatuses.BadRequest_400);
    await checkUserAuthentication(credentials01.login, incorrectPassword2, HttpStatuses.BadRequest_400);
    await checkUserAuthentication(credentials01.login, incorrectPassword3, HttpStatuses.BadRequest_400);
    await checkUserAuthentication(credentials01.login, incorrectPassword4, HttpStatuses.BadRequest_400);
    await checkUserAuthentication(credentials01.login, incorrectPassword5, HttpStatuses.BadRequest_400);
  });

  it('❌ 002 should not authenticate a user without proper credentials; POST /api/auth/login', async () => {
    const credentials01 = { login: 'user01', password: 'password123', email: 'user01@example.com' };
    const credentials02 = { login: 'tim01', password: 'password456', email: 'user02@example.ru' };
    await Promise.all([createUser(app, credentials01), createUser(app, credentials02)]);

    const checkUserAuthentication = async (
      loginOrEmail: string | null,
      password: string | null,
      status: HttpStatuses
    ) => {
      await request(app).post(`${SETTINGS.AUTH_PATH}/login`).send({ loginOrEmail, password }).expect(status);
    };

    await checkUserAuthentication(credentials01.login, credentials02.password, HttpStatuses.Unauthorized_401);
    await checkUserAuthentication(credentials01.email, credentials02.password, HttpStatuses.Unauthorized_401);
    await checkUserAuthentication(credentials02.login, credentials01.password, HttpStatuses.Unauthorized_401);
    await checkUserAuthentication(credentials02.email, credentials01.password, HttpStatuses.Unauthorized_401);
  });

  it('❌ 003 should not return user data without proper access token; GET /api/auth/login', async () => {
    const createUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserInputDTO);

    const loginResponse = await loginUser(app, {
      loginOrEmail: createUserInputDTO.login,
      password: createUserInputDTO.password,
    });

    const correctAccessToken: string = loginResponse;
    const incorrectAccessToken01: string = `${correctAccessToken}123`;
    const incorrectAccessToken02: string = ``;
    const incorrectAccessToken03: string = `zxc123ert`;
    const incorrectAccessToken04: null = null;
    const incorrectAccessToken05: number = 123456789;

    const checkMe = async (accessToken: any) => {
      await request(app)
        .get(`${SETTINGS.AUTH_PATH}/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatuses.Unauthorized_401);
    };

    await checkMe(incorrectAccessToken01);
    await checkMe(incorrectAccessToken02);
    await checkMe(incorrectAccessToken03);
    await checkMe(incorrectAccessToken04);
    await checkMe(incorrectAccessToken05);

    const meResponse = await request(app)
      .get(`${SETTINGS.AUTH_PATH}/me`)
      .set('Authorization', `Bearer ${correctAccessToken}`)
      .expect(HttpStatuses.Ok_200);

    expect(meResponse.body).toMatchObject({
      login: createUserInputDTO.login,
      email: createUserInputDTO.email,
    });

    const decodedToken = await jwtService.verifyToken(correctAccessToken);
    expect(decodedToken).not.toBeNull();

    const userResult = await usersService.findByLoginOrEmail(createUserInputDTO.login);
    const userId = userResult.data!.userOutputWithPasswordHash.id;
    expect(decodedToken?.userId).toEqual(userId);
  });
});
