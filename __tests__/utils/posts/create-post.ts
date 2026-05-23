import request from 'supertest';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { Express } from 'express';
import { generateBasicAuthToken } from '../auth/generate-admin-auth-token';
import { getCreatePostInputDTO } from './get-create-post-input-dto';
import { SETTINGS } from '../../../src/core/settings/settings';
import { CreatePostInputDTO } from '../../../src/posts/routes/input-dto/create-post.input-dto';
import { PostOutputDTO } from '../../../src/posts/routes/output-dto/post.output-dto';
import { createBlog } from '../blogs/create-blog';

export const createPost = async (
  app: Express,
  postDTO?: CreatePostInputDTO,
  blogId?: string
): Promise<PostOutputDTO> => {
  const newBlog = blogId ? null : await createBlog(app);
  const actualBlogId = newBlog ? newBlog.id : blogId;
  const testCreatePostData = { ...getCreatePostInputDTO(actualBlogId!), ...postDTO };

  const createPostResponse = await request(app)
    .post(SETTINGS.POSTS_PATH)
    .set('Authorization', generateBasicAuthToken())
    .send(testCreatePostData)
    .expect(HttpStatuses.Created_201);

  return createPostResponse.body;
};
