import { LoginDataInputDTO } from '../../../src/auth/routes/input-dto/login-data.input-dto';
import { Express } from 'express';
import { getLoginDataInputDTO } from './get-login-data-input-dto';
import { AccessTokenOutputDTO } from '../../../src/auth/routes/output-dto/access-token.output-dto';
import { SETTINGS } from '../../../src/core/settings/settings';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import request from 'supertest';

export const loginUser = async (app: Express, loginDataDTO?: LoginDataInputDTO): Promise<AccessTokenOutputDTO> => {
  const testLoginData: LoginDataInputDTO = { ...getLoginDataInputDTO(), ...loginDataDTO };

  const loginUserResponse = await request(app)
    .post(`${SETTINGS.AUTH_PATH}/login`)
    .send(testLoginData)
    .expect(HttpStatuses.Ok_200);

  return loginUserResponse.body;
};
