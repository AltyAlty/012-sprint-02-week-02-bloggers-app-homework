import 'dotenv/config';
import { createUser } from '../../utils/users/create-user';
import { jwtAdapter } from '../../../src/auth/adapters/jwt.adapter';
import { getCreateUserInputDTO } from '../../utils/users/get-create-user-input-dto';
import { loginUser } from '../../utils/auth/login-user';
import { doBeforeTests } from '../../utils/common/do-before-tests';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { LoginDataInputDTO } from '../../../src/auth/routes/input-dto/login-data.input-dto';
import { UserOutputDTO } from '../../../src/users/routes/output-dto/user.output-dto';
import { getAuthUserDataByAccessToken } from '../../utils/auth/get-auth-user-data-by-access-token';
import { MeOutputDTO } from '../../../src/auth/routes/output-dto/me.output-dto';

describe('Auth API', () => {
  const app = doBeforeTests();

  it('✅ 001 should authenticate a user when correct body passed; POST /api/auth/login', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createUserLogin: string = createUserData.login;
    const createUserEmail: string = createUserData.email;
    const createUserPassword: string = createUserData.password;
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const createdUserId: string = createdUser.id;
    const loginUserData_01: LoginDataInputDTO = { loginOrEmail: createUserLogin, password: createUserPassword };
    const loginUserData_02: LoginDataInputDTO = { loginOrEmail: createUserEmail, password: createUserPassword };

    const accessToken_01: string = await loginUser(app, loginUserData_01);
    const accessToken_02: string = await loginUser(app, loginUserData_02);
    const decodedToken_01: { userId: string } | null = await jwtAdapter.verifyToken(accessToken_01);
    const decodedToken_02: { userId: string } | null = await jwtAdapter.verifyToken(accessToken_02);

    expect(typeof accessToken_01).toBe('string');
    expect(typeof accessToken_02).toBe('string');
    expect(accessToken_01.length).toBeGreaterThan(3);
    expect(accessToken_02.length).toBeGreaterThan(3);
    expect(decodedToken_01).not.toBeNull();
    expect(decodedToken_02).not.toBeNull();
    expect(decodedToken_01!.userId).toBe(createdUserId);
    expect(decodedToken_02!.userId).toBe(createdUserId);
  });

  it('✅ 002 should return user data when correct access token passed; GET /api/auth/login', async () => {
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createUserLogin: string = createUserData.login;
    const createUserEmail: string = createUserData.email;
    const createUserPassword: string = createUserData.password;
    const createdUser: UserOutputDTO = await createUser(app, createUserData);
    const loginUserData: LoginDataInputDTO = { loginOrEmail: createUserLogin, password: createUserPassword };
    const accessToken: string = await loginUser(app, loginUserData);

    const authCreatedUserData: MeOutputDTO = await getAuthUserDataByAccessToken(app, accessToken);

    expect(authCreatedUserData).toEqual({
      login: createUserLogin,
      email: createUserEmail,
      createdAt: createdUser.createdAt,
    });
  });
});
