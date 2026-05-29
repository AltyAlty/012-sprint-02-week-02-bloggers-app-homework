import { Express } from 'express';
import { SETTINGS } from '../../../src/core/settings/settings';
import request from 'supertest';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { PaginatedPostsListOutputDTO } from '../../../src/posts/routes/output-dto/paginated-posts-list.output-dto';

export const getPostsListByBlogId = async (
  app: Express,
  blogId: any,
  urlWithPagination?: string,
  expectedStatus?: HttpStatuses
): Promise<PaginatedPostsListOutputDTO> => {
  const url = urlWithPagination ?? `${SETTINGS.BLOGS_PATH}/${blogId}/posts`;
  const testStatus = expectedStatus ?? HttpStatuses.Ok_200;
  const getPostsListByBlogIdResponse = await request(app).get(url).expect(testStatus);
  return getPostsListByBlogIdResponse.body;
};
