import { Express } from 'express';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { SETTINGS } from '../../../src/core/settings/settings';
import request from 'supertest';
import { generateBasicAuthToken } from '../auth/generate-admin-auth-token';
import { PaginatedUsersListOutputDTO } from '../../../src/users/routes/output-dto/paginated-users-list.output-dto';

export const getUsersList = async (
  app: Express,
  urlWithPagination?: string,
  expectedStatus?: HttpStatuses,
  basicAuthToken?: string
): Promise<PaginatedUsersListOutputDTO> => {
  const url = urlWithPagination ?? SETTINGS.USERS_PATH;
  const testStatus = expectedStatus ?? HttpStatuses.Ok_200;
  const testBasicAuthToken = basicAuthToken ?? generateBasicAuthToken();
  const getBlogsListResponse = await request(app).get(url).set('Authorization', testBasicAuthToken).expect(testStatus);
  return getBlogsListResponse.body;
};
