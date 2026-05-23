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

describe('Auth API body and auth validation checks', () => {
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
});
