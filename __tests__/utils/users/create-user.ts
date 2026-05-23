import { Express } from 'express';
import request from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { generateBasicAuthToken } from '../auth/generate-admin-auth-token';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { UserOutputDTO } from '../../../src/users/routes/output-dto/user.output-dto';
import { getCreateUserInputDTO } from './get-create-user-input-dto';

export const createUser = async (app: Express, userDTO?: CreateUserInputDTO): Promise<UserOutputDTO> => {
  const testCreateUserData: CreateUserInputDTO = { ...getCreateUserInputDTO(), ...userDTO };

  const createUserResponse = await request(app)
    .post(SETTINGS.USERS_PATH)
    .set('Authorization', generateBasicAuthToken())
    .send(testCreateUserData)
    .expect(HttpStatuses.Created_201);

  return createUserResponse.body;
};
