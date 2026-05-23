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
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { getCreateUserInputDTO } from '../../utils/users/get-create-user-input-dto';
import { UserOutputDTO } from '../../../src/users/routes/output-dto/user.output-dto';

describe('Users API ID, body and auth validation checks', () => {
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

  it('❌ 001 should not return a list of users without proper basic authorization; GET /api/users', async () => {
    await Promise.all([
      createUser(app, { login: 'user01', password: 'password123', email: 'user01@example.com' }),
      createUser(app, { login: 'user02', password: 'password456', email: 'user02@example.com' }),
    ]);

    const pageSize = 5;
    const pageNumber = 1;
    const sortDirection = 'asc';
    const sortBy = 'login';
    const correctQuery = `${SETTINGS.USERS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;
    await request(app).get(correctQuery).expect(HttpStatuses.Unauthorized_401);

    const getUsersListResponse = await request(app)
      .get(SETTINGS.USERS_PATH)
      .set('Authorization', adminToken)
      .expect(HttpStatuses.Ok_200);

    expect(getUsersListResponse.body.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.body.items.length).toBe(2);
    expect(getUsersListResponse.body.totalCount).toBe(2);
  });

  it('❌ 002 should not return a list of users when incorrect pagination settings passed; GET /api/users', async () => {
    await Promise.all([
      createUser(app, { login: 'user01', password: 'password123', email: 'user01@example.com' }),
      createUser(app, { login: 'user02', password: 'password456', email: 'user02@example.com' }),
    ]);

    const pageSize = 5;
    const pageNumber = 1;
    const sortDirection = 'asc';
    const sortBy = 'login';
    const correctQuery = `${SETTINGS.USERS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;

    const incorrectPageSize = 101;
    const incorrectPageNumber = -1;
    const incorrectSortDirection = 'cas';
    const incorrectSortBy = 'shortDescription';
    const incorrectQuery1 = `${SETTINGS.USERS_PATH}?pageSize=${incorrectPageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;
    const incorrectQuery2 = `${SETTINGS.USERS_PATH}?pageSize=${pageSize}&pageNumber=${incorrectPageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;
    const incorrectQuery3 = `${SETTINGS.USERS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${incorrectSortDirection}&sortBy=${sortBy}`;
    const incorrectQuery4 = `${SETTINGS.USERS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${incorrectSortBy}`;

    await request(app).get(incorrectQuery1).set('Authorization', adminToken).expect(HttpStatuses.BadRequest_400);
    await request(app).get(incorrectQuery2).set('Authorization', adminToken).expect(HttpStatuses.BadRequest_400);
    await request(app).get(incorrectQuery3).set('Authorization', adminToken).expect(HttpStatuses.BadRequest_400);
    await request(app).get(incorrectQuery4).set('Authorization', adminToken).expect(HttpStatuses.BadRequest_400);

    const getUsersListResponse = await request(app)
      .get(correctQuery)
      .set('Authorization', adminToken)
      .expect(HttpStatuses.Ok_200);

    expect(getUsersListResponse.body.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.body.items.length).toBe(2);
    expect(getUsersListResponse.body.totalCount).toBe(2);
  });

  it('❌ 003 should not create a user without proper basic authorization; POST /api/users', async () => {
    const correctCreateUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await request(app).post(SETTINGS.USERS_PATH).send(correctCreateUserData).expect(HttpStatuses.Unauthorized_401);

    const getUsersListResponse = await request(app)
      .get(SETTINGS.USERS_PATH)
      .set('Authorization', adminToken)
      .expect(HttpStatuses.Ok_200);

    expect(getUsersListResponse.body.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.body.items.length).toBe(0);
    expect(getUsersListResponse.body.totalCount).toBe(0);
  });

  it('❌ 004 should not create a user when incorrect body passed; POST /api/users', async () => {
    const correctCreateUserData: CreateUserInputDTO = getCreateUserInputDTO();

    const checkUserCreating = async (
      login: string | null = correctCreateUserData.login,
      password: string | null = correctCreateUserData.password,
      email = correctCreateUserData.email
    ) => {
      await request(app)
        .post(SETTINGS.USERS_PATH)
        .set('Authorization', adminToken)
        .send({ login, password, email })
        .expect(HttpStatuses.BadRequest_400);
    };

    await checkUserCreating('');
    await checkUserCreating('   ');
    await checkUserCreating('0123456789111111');
    await checkUserCreating('!@#$%^&*()');
    await checkUserCreating('ab');
    await checkUserCreating(null);
    await checkUserCreating(undefined, '');
    await checkUserCreating(undefined, '   ');
    await checkUserCreating(undefined, '12345');
    await checkUserCreating(undefined, '012345678901234567890');
    await checkUserCreating(undefined, '01234567890123456789000000');
    await checkUserCreating(undefined, null);
    await checkUserCreating(undefined, undefined, '');
    await checkUserCreating(undefined, undefined, '   ');
    await checkUserCreating(undefined, undefined, 'user#example.com');
    await checkUserCreating(undefined, undefined, 'fd2xny8xnf');

    const getUsersListResponse = await request(app)
      .get(SETTINGS.USERS_PATH)
      .set('Authorization', adminToken)
      .expect(HttpStatuses.Ok_200);

    expect(getUsersListResponse.body.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.body.items.length).toBe(0);
    expect(getUsersListResponse.body.totalCount).toBe(0);
  });

  it('❌ 005 should not create a user when non-unique login/email passed; POST /api/users', async () => {
    const createdUser: UserOutputDTO = await createUser(app);
    const correctCreateUserData: CreateUserInputDTO = getCreateUserInputDTO();

    await request(app)
      .post(SETTINGS.USERS_PATH)
      .set('Authorization', adminToken)
      .send({ login: createdUser.login, password: correctCreateUserData.password, email: 'user02@example.com' })
      .expect(HttpStatuses.BadRequest_400);

    await request(app)
      .post(SETTINGS.USERS_PATH)
      .set('Authorization', adminToken)
      .send({ login: 'user02', password: correctCreateUserData.password, email: createdUser.email })
      .expect(HttpStatuses.BadRequest_400);

    const getUsersListResponse = await request(app)
      .get(SETTINGS.USERS_PATH)
      .set('Authorization', adminToken)
      .expect(HttpStatuses.Ok_200);

    expect(getUsersListResponse.body.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.body.items.length).toBe(1);
    expect(getUsersListResponse.body.totalCount).toBe(1);
    expect(getUsersListResponse.body.items[0]).toEqual({ ...createdUser });
  });

  it('❌ 006 should not delete a user specified by ID without proper basic authorization; DELETE /api/users/:id', async () => {
    const createdUser: UserOutputDTO = await createUser(app);
    const createdUserId: string = createdUser.id;
    await request(app).delete(`${SETTINGS.USERS_PATH}/${createdUserId}`).expect(HttpStatuses.Unauthorized_401);

    const getUsersListResponse = await request(app)
      .get(SETTINGS.USERS_PATH)
      .set('Authorization', adminToken)
      .expect(HttpStatuses.Ok_200);

    expect(getUsersListResponse.body.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.body.items.length).toBe(1);
    expect(getUsersListResponse.body.totalCount).toBe(1);
    expect(getUsersListResponse.body.items[0]).toEqual({ ...createdUser });
  });

  it('❌ 007 should not delete a user specified by incorrect ID; DELETE /api/users/:id', async () => {
    const createdUser: UserOutputDTO = await createUser(app);
    const incorrectUserId1 = null;
    const incorrectUserId2 = 'ABC';
    const incorrectUserId3 = 2;
    const incorrectURL1 = `${SETTINGS.USERS_PATH}/${incorrectUserId1}`;
    const incorrectURL2 = `${SETTINGS.USERS_PATH}/${incorrectUserId2}`;
    const incorrectURL3 = `${SETTINGS.USERS_PATH}/${incorrectUserId3}`;

    await request(app).delete(incorrectURL1).set('Authorization', adminToken).expect(HttpStatuses.BadRequest_400);
    await request(app).delete(incorrectURL2).set('Authorization', adminToken).expect(HttpStatuses.BadRequest_400);
    await request(app).delete(incorrectURL3).set('Authorization', adminToken).expect(HttpStatuses.BadRequest_400);

    const getUsersListResponse = await request(app)
      .get(SETTINGS.USERS_PATH)
      .set('Authorization', adminToken)
      .expect(HttpStatuses.Ok_200);

    expect(getUsersListResponse.body.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.body.items.length).toBe(1);
    expect(getUsersListResponse.body.totalCount).toBe(1);
    expect(getUsersListResponse.body.items[0]).toEqual({ ...createdUser });
  });
});
