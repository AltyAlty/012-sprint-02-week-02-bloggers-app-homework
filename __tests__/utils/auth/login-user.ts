import { LoginDataInputDTO } from '../../../src/auth/routes/input-dto/login-data.input-dto';
import { Express } from 'express';
import { getLoginDataInputDTO } from './get-login-data-input-dto';
import { SETTINGS } from '../../../src/core/settings/settings';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import request from 'supertest';

export const loginUser = async (
  app: Express,
  loginDataDTO?: LoginDataInputDTO,
  expectedStatus?: HttpStatuses
): Promise<string> => {
  const testLoginData: LoginDataInputDTO = { ...getLoginDataInputDTO(), ...loginDataDTO };
  const testStatus = expectedStatus ?? HttpStatuses.Ok_200;

  const loginUserResponse = await request(app)
    .post(`${SETTINGS.AUTH_PATH}/login`)
    .send(testLoginData)
    .expect(testStatus);

  return loginUserResponse.body.accessToken;
};
