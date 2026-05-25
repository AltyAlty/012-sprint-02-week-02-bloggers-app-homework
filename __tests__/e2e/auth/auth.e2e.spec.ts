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
import { jwtService } from '../../../src/auth/adapters/jwt.service';
import { usersService } from '../../../src/users/application/users.service';

describe('Auth API endpoints check', () => {
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

  it('✅ 001 should authenticate a user when correct body passed; POST /api/auth/login', async () => {
    const credentials01 = { login: 'user01', password: 'password123', email: 'user01@example.com' };
    const credentials02 = { login: 'tim01', password: 'password456', email: 'user02@example.ru' };
    await Promise.all([createUser(app, credentials01), createUser(app, credentials02)]);

    const checkUserAuthentication = async (loginOrEmail: string, password: string) =>
      await request(app)
        .post(`${SETTINGS.AUTH_PATH}/login`)
        .send({ loginOrEmail, password })
        .expect(HttpStatuses.Ok_200);

    const loginResponse = await checkUserAuthentication(credentials01.login, credentials01.password);
    await checkUserAuthentication(credentials01.email, credentials01.password);
    await checkUserAuthentication(credentials02.login, credentials02.password);
    await checkUserAuthentication(credentials02.email, credentials02.password);

    expect(loginResponse.body).toHaveProperty('accessToken');
    const accessToken = loginResponse.body.accessToken;
    expect(typeof accessToken).toBe('string');
    expect(accessToken.length).toBeGreaterThan(0);

    const meResponse = await request(app)
      .get(`${SETTINGS.AUTH_PATH}/me`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatuses.Ok_200);

    expect(meResponse.body).toMatchObject({
      login: credentials01.login,
      email: credentials01.email,
    });

    const decodedToken = await jwtService.verifyToken(accessToken);
    expect(decodedToken).not.toBeNull();

    const userResult = await usersService.findByLoginOrEmail(credentials01.login);
    const userId = userResult.data?.userOutput.id;
    expect(decodedToken?.userId).toEqual(userId);
  });
});
