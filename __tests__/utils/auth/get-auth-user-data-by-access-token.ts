import { Express } from 'express';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import request from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { MeOutputDTO } from '../../../src/auth/routes/output-dto/me.output-dto';

export const getAuthUserDataByAccessToken = async (
  app: Express,
  accessToken: string | any,
  expectedStatus?: HttpStatuses
): Promise<MeOutputDTO> => {
  const testStatus = expectedStatus ?? HttpStatuses.Ok_200;

  const getUserDataByAccessTokenResponse = await request(app)
    .get(`${SETTINGS.AUTH_PATH}/me`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(testStatus);

  return getUserDataByAccessTokenResponse.body;
};
