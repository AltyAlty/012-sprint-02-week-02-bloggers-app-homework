import { Express } from 'express';
import request from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { PaginatedBlogsListOutputDTO } from '../../../src/blogs/routes/output-dto/paginated-blogs-list.output-dto';

export const getBlogsList = async (
  app: Express,
  urlWithPagination?: string,
  expectedStatus?: HttpStatuses
): Promise<PaginatedBlogsListOutputDTO> => {
  const url = urlWithPagination ?? SETTINGS.BLOGS_PATH;
  const testStatus = expectedStatus ?? HttpStatuses.Ok_200;
  const getBlogsListResponse = await request(app).get(url).expect(testStatus);
  return getBlogsListResponse.body;
};
