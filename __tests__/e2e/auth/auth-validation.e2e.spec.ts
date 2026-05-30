import 'dotenv/config';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { createUser } from '../../utils/users/create-user';
import { getCreateUserInputDTO } from '../../utils/users/get-create-user-input-dto';
import { loginUser } from '../../utils/auth/login-user';
import { jwtService } from '../../../src/auth/adapters/jwt.service';
import { doBeforeTests } from '../../utils/common/do-before-tests';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { UserOutputDTO } from '../../../src/users/routes/output-dto/user.output-dto';
import { LoginDataInputDTO } from '../../../src/auth/routes/input-dto/login-data.input-dto';
import { MeOutputDTO } from '../../../src/auth/routes/output-dto/me.output-dto';
import { getAuthUserDataByAccessToken } from '../../utils/auth/get-auth-user-data-by-access-token';

describe('Auth API validation', () => {
  const app = doBeforeTests();

  it('❌ 001 should not authenticate a user when incorrect body passed; POST /api/auth/login', async () => {
    const incorrectLoginOrEmail_01: string = '';
    const incorrectLoginOrEmail_02: string = '    ';
    const incorrectLoginOrEmail_03: null = null;
    const incorrectPassword_01: string = '';
    const incorrectPassword_02: string = '   ';
    const incorrectPassword_03: string = '1';
    const incorrectPassword_04: string = '012345678900123456789000000';
    const incorrectPassword_05: null = null;
    const correctCreateUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const correctCreateUserLogin: string = correctCreateUserData.login;
    const correctCreateUserEmail: string = correctCreateUserData.email;
    const correctCreateUserPassword: string = correctCreateUserData.password;
    const createdUser: UserOutputDTO = await createUser(app, correctCreateUserData);
    const createdUserId: string = createdUser.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await loginUser(app, { loginOrEmail: incorrectLoginOrEmail_01 }, testStatus);
    await loginUser(app, { loginOrEmail: incorrectLoginOrEmail_02 }, testStatus);
    await loginUser(app, { loginOrEmail: incorrectLoginOrEmail_03 }, testStatus);
    await loginUser(app, { password: incorrectPassword_01 }, testStatus);
    await loginUser(app, { password: incorrectPassword_02 }, testStatus);
    await loginUser(app, { password: incorrectPassword_03 }, testStatus);
    await loginUser(app, { password: incorrectPassword_04 }, testStatus);
    await loginUser(app, { password: incorrectPassword_05 }, testStatus);

    const accessToken_01: string = await loginUser(app, {
      loginOrEmail: correctCreateUserLogin,
      password: correctCreateUserPassword,
    });

    const accessToken_02: string = await loginUser(app, {
      loginOrEmail: correctCreateUserEmail,
      password: correctCreateUserPassword,
    });

    const decodedToken_01: { userId: string } | null = await jwtService.verifyToken(accessToken_01);
    const decodedToken_02: { userId: string } | null = await jwtService.verifyToken(accessToken_02);

    expect(typeof accessToken_01).toBe('string');
    expect(typeof accessToken_02).toBe('string');
    expect(accessToken_01.length).toBeGreaterThan(3);
    expect(accessToken_02.length).toBeGreaterThan(3);
    expect(decodedToken_01).not.toBeNull();
    expect(decodedToken_02).not.toBeNull();
    expect(decodedToken_01!.userId).toBe(createdUserId);
    expect(decodedToken_02!.userId).toBe(createdUserId);
  });

  it('❌ 002 should not authenticate a user without proper credentials; POST /api/auth/login', async () => {
    const createUserData_01: CreateUserInputDTO = getCreateUserInputDTO();

    const createUserData_02: CreateUserInputDTO = {
      login: 'user02',
      password: 'zxc321QWE654',
      email: 'user02@example.com',
    };

    const createUserLogin_01: string = createUserData_01.login;
    const createUserEmail_01: string = createUserData_01.email;
    const createUserPassword_01: string = createUserData_01.password;
    const createUserLogin_02: string = createUserData_02.login;
    const createUserEmail_02: string = createUserData_02.email;
    const createUserPassword_02: string = createUserData_02.password;
    const createdUser_01: UserOutputDTO = await createUser(app, createUserData_01);
    const createdUserId_01: string = createdUser_01.id;
    const createdUser_02: UserOutputDTO = await createUser(app, createUserData_02);
    const createdUserId_02: string = createdUser_02.id;
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await loginUser(app, { loginOrEmail: createUserLogin_02, password: createUserPassword_01 }, testStatus);
    await loginUser(app, { loginOrEmail: createUserEmail_02, password: createUserPassword_01 }, testStatus);
    await loginUser(app, { loginOrEmail: createUserLogin_01, password: createUserPassword_02 }, testStatus);
    await loginUser(app, { loginOrEmail: createUserEmail_01, password: createUserPassword_02 }, testStatus);

    const accessToken_01: string = await loginUser(app, {
      loginOrEmail: createUserLogin_01,
      password: createUserPassword_01,
    });

    const accessToken_02: string = await loginUser(app, {
      loginOrEmail: createUserEmail_01,
      password: createUserPassword_01,
    });

    const accessToken_03: string = await loginUser(app, {
      loginOrEmail: createUserLogin_02,
      password: createUserPassword_02,
    });

    const accessToken_04: string = await loginUser(app, {
      loginOrEmail: createUserEmail_02,
      password: createUserPassword_02,
    });

    const decodedToken_01: { userId: string } | null = await jwtService.verifyToken(accessToken_01);
    const decodedToken_02: { userId: string } | null = await jwtService.verifyToken(accessToken_02);
    const decodedToken_03: { userId: string } | null = await jwtService.verifyToken(accessToken_03);
    const decodedToken_04: { userId: string } | null = await jwtService.verifyToken(accessToken_04);

    expect(typeof accessToken_01).toBe('string');
    expect(typeof accessToken_02).toBe('string');
    expect(typeof accessToken_03).toBe('string');
    expect(typeof accessToken_04).toBe('string');
    expect(accessToken_01.length).toBeGreaterThan(3);
    expect(accessToken_02.length).toBeGreaterThan(3);
    expect(accessToken_03.length).toBeGreaterThan(3);
    expect(accessToken_04.length).toBeGreaterThan(3);
    expect(decodedToken_01).not.toBeNull();
    expect(decodedToken_02).not.toBeNull();
    expect(decodedToken_03).not.toBeNull();
    expect(decodedToken_04).not.toBeNull();
    expect(decodedToken_01!.userId).toBe(createdUserId_01);
    expect(decodedToken_02!.userId).toBe(createdUserId_01);
    expect(decodedToken_03!.userId).toBe(createdUserId_02);
    expect(decodedToken_04!.userId).toBe(createdUserId_02);
  });

  it('❌ 003 should not return user data without proper access token; GET /api/auth/login', async () => {
    const incorrectAccessToken_01: string = '';
    const incorrectAccessToken_02: string = '   ';
    const incorrectAccessToken_03: string = 'token';
    const incorrectAccessToken_04: number = 2;
    const incorrectAccessToken_05: null = null;
    const incorrectAccessToken_06: undefined = undefined;
    const incorrectAccessToken_07: [] = [];
    const incorrectAccessToken_08: {} = {};
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createUserLogin: string = createUserData.login;
    const createUserEmail: string = createUserData.email;
    const createUserPassword: string = createUserData.password;
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserLogin, password: createUserPassword };
    const accessToken: string = await loginUser(app, loginUserData);
    const testStatus: HttpStatuses = HttpStatuses.Unauthorized_401;

    await getAuthUserDataByAccessToken(app, incorrectAccessToken_01, testStatus);
    await getAuthUserDataByAccessToken(app, incorrectAccessToken_02, testStatus);
    await getAuthUserDataByAccessToken(app, incorrectAccessToken_03, testStatus);
    await getAuthUserDataByAccessToken(app, incorrectAccessToken_04, testStatus);
    await getAuthUserDataByAccessToken(app, incorrectAccessToken_05, testStatus);
    await getAuthUserDataByAccessToken(app, incorrectAccessToken_06, testStatus);
    await getAuthUserDataByAccessToken(app, incorrectAccessToken_07, testStatus);
    await getAuthUserDataByAccessToken(app, incorrectAccessToken_08, testStatus);
    const authCreatedUserData: MeOutputDTO = await getAuthUserDataByAccessToken(app, accessToken);

    expect(authCreatedUserData).toEqual({
      login: createUserLogin,
      email: createUserEmail,
      createdAt: createdUser.createdAt,
    });
  });
});
