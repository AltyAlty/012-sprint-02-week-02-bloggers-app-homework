import { Express } from 'express';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import request from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';

export const deleteCommentById = async (
  app: Express,
  commentId: string | any,
  accessToken: string,
  expectedStatus?: HttpStatuses
): Promise<void> => {
  const testStatus = expectedStatus ?? HttpStatuses.NoContent_204;

  await request(app)
    .delete(`${SETTINGS.COMMENTS_PATH}/${commentId}`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(testStatus);
};
