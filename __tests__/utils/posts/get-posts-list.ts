import { Express } from 'express';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { PaginatedPostsListOutputDTO } from '../../../src/posts/routes/output-dto/paginated-posts-list.output-dto';
import { SETTINGS } from '../../../src/core/settings/settings';
import request from 'supertest';

export const getPostsList = async (
  app: Express,
  urlWithPagination?: string,
  expectedStatus?: HttpStatuses
): Promise<PaginatedPostsListOutputDTO> => {
  const url = urlWithPagination ?? `${SETTINGS.POSTS_PATH}`;
  const testStatus = expectedStatus ?? HttpStatuses.Ok_200;
  const getPostsListResponse = await request(app).get(url).expect(testStatus);
  return getPostsListResponse.body;
};
