import request from 'supertest';
import { Express } from 'express';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { SETTINGS } from '../../../src/core/settings/settings';
import { PostOutputDTO } from '../../../src/posts/routes/output-dto/post.output-dto';

export const getPostById = async (
  app: Express,
  postId: string,
  expectedStatus?: HttpStatus
): Promise<PostOutputDTO> => {
  const testStatus = expectedStatus ?? HttpStatus.Ok_200;
  const getPostResponse = await request(app).get(`${SETTINGS.POSTS_PATH}/${postId}`).expect(testStatus);
  return getPostResponse.body;
};
