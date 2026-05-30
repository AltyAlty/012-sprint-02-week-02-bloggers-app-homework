import 'dotenv/config';
import { SETTINGS } from '../../../src/core/settings/settings';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { createUser } from '../../utils/users/create-user';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { UserOutputDTO } from '../../../src/users/routes/output-dto/user.output-dto';
import { doBeforeTests } from '../../utils/common/do-before-tests';
import { PaginatedUsersListOutputDTO } from '../../../src/users/routes/output-dto/paginated-users-list.output-dto';
import { getUsersList } from '../../utils/users/get-users-list';
import { deleteUserById } from '../../utils/users/delete-user-by-id';

describe('Users API validation', () => {
  const app = doBeforeTests();

  it('❌ 001 should not return a list of users without proper basic authorization; GET /api/users', async () => {
    await Promise.all([createUser(app), createUser(app)]);

    await getUsersList(app, undefined, HttpStatuses.Unauthorized_401, 'token');
    const getUsersListResponse: PaginatedUsersListOutputDTO = await getUsersList(app);

    expect(getUsersListResponse.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.items.length).toBe(2);
    expect(getUsersListResponse.totalCount).toBe(2);
  });

  it('❌ 002 should not return a list of users when incorrect pagination settings passed; GET /api/users', async () => {
    const correctPageSize: number = 5;
    const correctPageNumber: number = 1;
    const correctSearchLoginTerm: string = 'i';
    const correctSearchEmailTerm: string = 'abc';
    const correctSortDirection: string = 'asc';
    const correctSortBy: string = 'login';
    const correctUrl: string = `${SETTINGS.USERS_PATH}?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&searchLoginTerm=${correctSearchLoginTerm}&searchEmailTerm=${correctSearchEmailTerm}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectPageSize: number = 101;
    const incorrectPageNumber: number = -1;
    const incorrectSortDirection: string = 'cas';
    const incorrectSortBy: string = 'name';
    const incorrectUrl_01: string = `${SETTINGS.USERS_PATH}?pageSize=${incorrectPageSize}&pageNumber=${correctPageNumber}&searchLoginTerm=${correctSearchLoginTerm}&searchEmailTerm=${correctSearchEmailTerm}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_02: string = `${SETTINGS.USERS_PATH}?pageSize=${correctPageSize}&pageNumber=${incorrectPageNumber}&searchLoginTerm=${correctSearchLoginTerm}&searchEmailTerm=${correctSearchEmailTerm}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_03: string = `${SETTINGS.USERS_PATH}?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&searchLoginTerm=${correctSearchLoginTerm}&searchEmailTerm=${correctSearchEmailTerm}&sortDirection=${incorrectSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_04: string = `${SETTINGS.USERS_PATH}?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&searchLoginTerm=${correctSearchLoginTerm}&searchEmailTerm=${correctSearchEmailTerm}&sortDirection=${correctSortDirection}&sortBy=${incorrectSortBy}`;
    const userData_01: { login: string; email: string } = { login: 'John', email: 'moon@example.com' };
    const userData_02: { login: string; email: string } = { login: 'Abby', email: 'earth@example.com' };
    const userData_03: { login: string; email: string } = { login: 'Mike', email: 'pluto@example.com' };
    const userData_04: { login: string; email: string } = { login: 'Jim', email: 'mercury@example.abc' };
    const userData_05: { login: string; email: string } = { login: 'Kate', email: 'venus@example.com' };
    const userData_06: { login: string; email: string } = { login: 'Billy', email: 'satrun@example.abc' };

    await Promise.all([
      createUser(app, userData_01),
      createUser(app, userData_02),
      createUser(app, userData_03),
      createUser(app, userData_04),
      createUser(app, userData_05),
      createUser(app, userData_06),
    ]);

    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await getUsersList(app, incorrectUrl_01, testStatus);
    await getUsersList(app, incorrectUrl_02, testStatus);
    await getUsersList(app, incorrectUrl_03, testStatus);
    await getUsersList(app, incorrectUrl_04, testStatus);
    const getUsersListResponse: PaginatedUsersListOutputDTO = await getUsersList(app, correctUrl);

    expect(getUsersListResponse.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.items.length).toBe(3);
    expect(getUsersListResponse.totalCount).toBe(3);
    expect(getUsersListResponse.items[0].login).toBe(userData_06.login);
    expect(getUsersListResponse.items[1].login).toBe(userData_04.login);
    expect(getUsersListResponse.items[2].login).toBe(userData_03.login);
  });

  it('❌ 003 should not create a user without proper basic authorization; POST /api/users', async () => {
    await createUser(app, undefined, HttpStatuses.Unauthorized_401, 'token');
    const getUsersListResponse: PaginatedUsersListOutputDTO = await getUsersList(app);

    expect(getUsersListResponse.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.items.length).toBe(0);
    expect(getUsersListResponse.totalCount).toBe(0);
  });

  it('❌ 004 should not create a user when incorrect body passed; POST /api/users', async () => {
    const incorrectLogin_01: string = '';
    const incorrectLogin_02: string = '   ';
    const incorrectLogin_03: string = '0123456789111111';
    const incorrectLogin_04: string = '!@#$%^&*()';
    const incorrectLogin_05: string = 'ab';
    const incorrectLogin_06: null = null;
    const incorrectPassword_01: string = '';
    const incorrectPassword_02: string = '   ';
    const incorrectPassword_03: string = '12345';
    const incorrectPassword_04: string = '012345678901234567890';
    const incorrectPassword_05: string = '01234567890123456789000000';
    const incorrectPassword_06: null = null;
    const incorrectEmail_01: string = '';
    const incorrectEmail_02: string = '   ';
    const incorrectEmail_03: string = 'user#example.com';
    const incorrectEmail_04: string = 'fd2xny8xnf';
    const incorrectEmail_05: null = null;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await createUser(app, { login: incorrectLogin_01 }, testStatus);
    await createUser(app, { login: incorrectLogin_02 }, testStatus);
    await createUser(app, { login: incorrectLogin_03 }, testStatus);
    await createUser(app, { login: incorrectLogin_04 }, testStatus);
    await createUser(app, { login: incorrectLogin_05 }, testStatus);
    await createUser(app, { login: incorrectLogin_06 }, testStatus);
    await createUser(app, { password: incorrectPassword_01 }, testStatus);
    await createUser(app, { password: incorrectPassword_02 }, testStatus);
    await createUser(app, { password: incorrectPassword_03 }, testStatus);
    await createUser(app, { password: incorrectPassword_04 }, testStatus);
    await createUser(app, { password: incorrectPassword_05 }, testStatus);
    await createUser(app, { password: incorrectPassword_06 }, testStatus);
    await createUser(app, { email: incorrectEmail_01 }, testStatus);
    await createUser(app, { email: incorrectEmail_02 }, testStatus);
    await createUser(app, { email: incorrectEmail_03 }, testStatus);
    await createUser(app, { email: incorrectEmail_04 }, testStatus);
    await createUser(app, { email: incorrectEmail_05 }, testStatus);
    const getUsersListResponse: PaginatedUsersListOutputDTO = await getUsersList(app);

    expect(getUsersListResponse.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.items.length).toBe(0);
    expect(getUsersListResponse.totalCount).toBe(0);
  });

  it('❌ 005 should not create a user when non-unique login/email passed; POST /api/users', async () => {
    const correctCreateUserData: CreateUserInputDTO = {
      login: 'user01',
      password: 'qwe123ZXC456',
      email: 'user01@example.com',
    };

    const incorrectCreateUserData_01: CreateUserInputDTO = { ...correctCreateUserData, email: 'user02@example.com' };
    const incorrectCreateUserData_02: CreateUserInputDTO = { ...correctCreateUserData, login: 'user03' };
    const createdUser: UserOutputDTO = await createUser(app, correctCreateUserData);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await createUser(app, incorrectCreateUserData_01, testStatus);
    await createUser(app, incorrectCreateUserData_02, testStatus);
    const getUsersListResponse: PaginatedUsersListOutputDTO = await getUsersList(app);

    expect(getUsersListResponse.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.items.length).toBe(1);
    expect(getUsersListResponse.totalCount).toBe(1);
    expect(getUsersListResponse.items[0]).toEqual(createdUser);
  });

  it('❌ 006 should not delete a user by ID without proper basic authorization; DELETE /api/users/:id', async () => {
    const createdUser: UserOutputDTO = await createUser(app);
    const createdUserId: string = createdUser.id;

    await deleteUserById(app, createdUserId, HttpStatuses.Unauthorized_401, 'token');
    const getUsersListResponse: PaginatedUsersListOutputDTO = await getUsersList(app);

    expect(getUsersListResponse.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.items.length).toBe(1);
    expect(getUsersListResponse.totalCount).toBe(1);
    expect(getUsersListResponse.items[0]).toEqual(createdUser);
  });

  it('❌ 007 should not delete a user by incorrect ID; DELETE /api/users/:id', async () => {
    const incorrectUserId_01: string = 'ABC';
    const incorrectUserId_02: number = 2;
    const incorrectUserId_03: null = null;
    const createdUser: UserOutputDTO = await createUser(app);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await deleteUserById(app, incorrectUserId_01, testStatus);
    await deleteUserById(app, incorrectUserId_02, testStatus);
    await deleteUserById(app, incorrectUserId_03, testStatus);
    const getUsersListResponse: PaginatedUsersListOutputDTO = await getUsersList(app);

    expect(getUsersListResponse.items).toBeInstanceOf(Array);
    expect(getUsersListResponse.items.length).toBe(1);
    expect(getUsersListResponse.totalCount).toBe(1);
    expect(getUsersListResponse.items[0]).toEqual(createdUser);
  });
});
