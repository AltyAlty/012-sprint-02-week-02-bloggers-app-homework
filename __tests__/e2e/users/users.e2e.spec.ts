import 'dotenv/config';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { generateBasicAuthToken } from '../../utils/auth/generate-admin-auth-token';
import { runDB, stopDb } from '../../../src/db/mongodb/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import { clearDb } from '../../utils/db/clear-db';
import { UserOutputDTO } from '../../../src/users/routes/output-dto/user.output-dto';
import { createUser } from '../../utils/users/create-user';
import request from 'supertest';
import { HttpStatus } from '../../../src/core/types/http-statuses';

describe('Users API endpoints check', () => {
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

  it('✅ 001 should create a user; POST /api/users', async () => {
    const createdUser: UserOutputDTO = await createUser(app);

    const getUsersListResponse = await request(app)
      .get(SETTINGS.USERS_PATH)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok_200);

    expect(getUsersListResponse.body.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.body.items.length).toBe(1);
    expect(getUsersListResponse.body.totalCount).toBe(1);
    expect(getUsersListResponse.body.items[0]).toEqual({ ...createdUser });
    expect(getUsersListResponse.body.items[0]).not.toHaveProperty('password');
    expect(getUsersListResponse.body.items[0]).not.toHaveProperty('passwordHash');
  });

  it('✅ 002 should return a list of users; GET /api/users', async () => {
    await Promise.all([
      createUser(app, { login: 'user01', password: 'password123', email: 'user01@example.com' }),
      createUser(app, { login: 'user02', password: 'password456', email: 'user02@example.com' }),
    ]);

    const getUsersListResponse = await request(app)
      .get(SETTINGS.USERS_PATH)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok_200);

    expect(getUsersListResponse.body.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.body.items.length).toBe(2);
    expect(getUsersListResponse.body.totalCount).toBe(2);
    expect(getUsersListResponse.body.items[0]).not.toHaveProperty('password');
    expect(getUsersListResponse.body.items[0]).not.toHaveProperty('passwordHash');
  });

  it('✅ 003 should return a list of users when correct pagination settings passed; GET /api/users', async () => {
    await Promise.all([
      createUser(app, { login: 'user01', password: 'password123', email: 'user01@example.com' }),
      createUser(app, { login: 'tim01', password: 'password456', email: 'user02@example.ru' }),
      createUser(app, { login: 'TimTim', password: 'password456', email: 'user03@example.com' }),
      createUser(app, { login: 'user02', password: 'password456', email: 'user04@example.ru' }),
      createUser(app, { login: 'user03', password: 'password456', email: 'user05@example.ru' }),
      createUser(app, { login: 'userTim', password: 'password456', email: 'user06@example.com' }),
      createUser(app, { login: 'user04', password: 'password456', email: 'user07@example.ru' }),
    ]);

    const pageSize = 5;
    const pageNumber = 1;
    const searchLoginTerm = 'Tim';
    const searchEmailTerm = '.com';
    const sortDirection = 'asc';
    const sortBy = 'email';

    const getUsersListResponse = await request(app)
      .get(
        `${SETTINGS.USERS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&searchLoginTerm=${searchLoginTerm}&searchEmailTerm=${searchEmailTerm}&sortDirection=${sortDirection}&sortBy=${sortBy}`
      )
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok_200);

    expect(getUsersListResponse.body.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.body.items.length).toBe(4);
    expect(getUsersListResponse.body.totalCount).toBe(4);
    expect(getUsersListResponse.body.items[0].login).toBe('user01');
    expect(getUsersListResponse.body.items[1].login).toBe('tim01');
    expect(getUsersListResponse.body.items[2].login).toBe('TimTim');
    expect(getUsersListResponse.body.items[3].login).toBe('userTim');
  });

  it('✅ 004 should delete a user by ID; DELETE /api/users/:id', async () => {
    const createdUser: UserOutputDTO = await createUser(app);
    const createdUserId: string = createdUser.id;

    await request(app)
      .delete(`${SETTINGS.USERS_PATH}/${createdUserId}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NoContent_204);

    const getUsersListResponse = await request(app)
      .get(SETTINGS.USERS_PATH)
      .set('Authorization', adminToken)
      .expect(HttpStatus.Ok_200);

    expect(getUsersListResponse.body.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.body.items.length).toBe(0);
    expect(getUsersListResponse.body.totalCount).toBe(0);
  });
});
