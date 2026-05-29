import { Express } from 'express';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { SETTINGS } from '../../../src/core/settings/settings';
import request from 'supertest';
import { PaginatedCommentsListOutputDTO } from '../../../src/comments/routes/output-dto/paginated-comments-list.output-dto';

export const getCommentsListByPostId = async (
  app: Express,
  postId: any,
  urlWithPagination?: string,
  expectedStatus?: HttpStatuses
): Promise<PaginatedCommentsListOutputDTO> => {
  const url = urlWithPagination ?? `${SETTINGS.POSTS_PATH}/${postId}/comments`;
  const testStatus = expectedStatus ?? HttpStatuses.Ok_200;
  const getCommentsListByPostIdResponse = await request(app).get(url).expect(testStatus);
  return getCommentsListByPostIdResponse.body;
};
