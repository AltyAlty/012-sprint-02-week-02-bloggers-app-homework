import { Express } from 'express';
import request from 'supertest';
import { SETTINGS } from '../../../src/core/settings/settings';
import { generateBasicAuthToken } from '../auth/generate-admin-auth-token';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { UpdatePostInputDTO } from '../../../src/posts/routes/input-dto/update-post.input-dto';
import { getUpdatePostInputDTO } from './get-update-post-input-dto';

export const updatePostById = async (
  app: Express,
  postId: string,
  blogId: string,
  postDTO?: UpdatePostInputDTO
): Promise<void> => {
  const testUpdatePostData: UpdatePostInputDTO = { ...getUpdatePostInputDTO(blogId), ...postDTO };

  const updatePostResponse = await request(app)
    .put(`${SETTINGS.POSTS_PATH}/${postId}`)
    .set('Authorization', generateBasicAuthToken())
    .send(testUpdatePostData)
    .expect(HttpStatus.NoContent_204);

  return updatePostResponse.body;
};
