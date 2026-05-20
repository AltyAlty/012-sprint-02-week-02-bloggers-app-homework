import 'dotenv/config';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { generateBasicAuthToken } from '../../utils/auth/generate-admin-auth-token';
import { runDB, stopDb } from '../../../src/db/mongodb/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import { clearDb } from '../../utils/db/clear-db';
import request from 'supertest';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { createUser } from '../../utils/users/create-user';

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

    const checkUserAuthentication = async (loginOrEmail: string, password: string) => {
      await request(app)
        .post(`${SETTINGS.AUTH_PATH}/login`)
        .send({ loginOrEmail, password })
        .expect(HttpStatus.NoContent_204);
    };

    await checkUserAuthentication(credentials01.login, credentials01.password);
    await checkUserAuthentication(credentials01.email, credentials01.password);
    await checkUserAuthentication(credentials02.login, credentials02.password);
    await checkUserAuthentication(credentials02.email, credentials02.password);
  });
});
