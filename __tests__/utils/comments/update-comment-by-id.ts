import { Express } from 'express';
import request from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { getUpdateCommentInputDTO } from './get-update-comment-input-dto';
import { UpdateCommentInputDTO } from '../../../src/comments/routes/input-dto/update-comment.input-dto';

export const updateCommentById = async (
  app: Express,
  commentId: string,
  accessToken: string,
  commentDTO?: UpdateCommentInputDTO
): Promise<void> => {
  const testUpdateCommentData: UpdateCommentInputDTO = { ...getUpdateCommentInputDTO(), ...commentDTO };

  const updateCommentResponse = await request(app)
    .put(`${SETTINGS.COMMENTS_PATH}/${commentId}`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send(testUpdateCommentData)
    .expect(HttpStatuses.NoContent_204);

  return updateCommentResponse.body;
};
