import 'dotenv/config';
import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { generateBasicAuthToken } from '../../utils/auth/generate-admin-auth-token';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { clearDb } from '../../utils/db/clear-db';
import { runDB, stopDb } from '../../../src/db/mongodb/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import { createBlog } from '../../utils/blogs/create-blog';
import { createPost } from '../../utils/posts/create-post';
import { BlogOutputDTO } from '../../../src/blogs/routes/output-dto/blog.output-dto';
import { PostOutputDTO } from '../../../src/posts/routes/output-dto/post.output-dto';
import { getPostById } from '../../utils/posts/get-post-by-id';
import { UpdatePostInputDTO } from '../../../src/posts/routes/input-dto/update-post.input-dto';
import { updatePostById } from '../../utils/posts/update-post-by-id';
import { getUpdatePostInputDTO } from '../../utils/posts/get-update-post-input-dto';

describe('Posts API endpoints check', () => {
  const app = express();
  setupApp(app);
  const adminToken = generateBasicAuthToken();

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL, SETTINGS.TEST_DB_NAME);
    await clearDb(app);
  });

  beforeEach(async () => await clearDb(app));

  afterAll(async () => {
    await clearDb(app);
    await stopDb();
  });

  it('✅ 001 should create a post; POST /api/posts', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const getPostsListResponse = await request(app).get(SETTINGS.POSTS_PATH).expect(HttpStatus.Ok_200);
    expect(getPostsListResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListResponse.body.items.length).toBe(1);
    expect(getPostsListResponse.body.totalCount).toBe(1);
    expect(getPostsListResponse.body.items[0]).toEqual({ ...createdPost });
  });

  it('✅ 002 should return a list of posts; GET /api/posts', async () => {
    await Promise.all([createPost(app), createPost(app)]);
    const getPostsListResponse = await request(app).get(SETTINGS.POSTS_PATH).expect(HttpStatus.Ok_200);
    expect(getPostsListResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListResponse.body.items.length).toBe(2);
    expect(getPostsListResponse.body.totalCount).toBe(2);
  });

  it('✅ 003 should return a list of posts when correct pagination settings passed; GET /api/posts', async () => {
    await Promise.all([
      createPost(app),
      createPost(app),
      createPost(app),
      createPost(app),
      createPost(app),
      createPost(app),
    ]);

    const pageSize = 5;
    const pageNumber = 1;
    const sortDirection = 'asc';
    const sortBy = 'title';

    const getPostsListResponse = await request(app)
      .get(
        `${SETTINGS.POSTS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`
      )
      .expect(HttpStatus.Ok_200);

    expect(getPostsListResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListResponse.body.items.length).toBe(5);
    expect(getPostsListResponse.body.totalCount).toBe(6);
  });

  it('✅ 004 should return a post by ID; GET /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);
    expect(getPostByIdResponse).toEqual({ ...createdPost });
  });

  it('✅ 005 should update a post by ID; PUT /api/posts/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const createdPost: PostOutputDTO = await createPost(app, undefined, createdBlogId);
    const createdPostId: string = createdPost.id;
    const updatePostData: UpdatePostInputDTO = getUpdatePostInputDTO(createdBlogId);
    await updatePostById(app, createdPostId, createdBlogId, updatePostData);
    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);

    expect(getPostByIdResponse).toEqual({
      id: createdPostId,
      title: updatePostData.title,
      shortDescription: updatePostData.shortDescription,
      content: updatePostData.content,
      blogId: createdBlogId,
      blogName: createdBlog.name,
      createdAt: expect.any(String),
    });
  });

  it('✅ 006 should delete a post by ID; DELETE /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    await request(app)
      .delete(`${SETTINGS.POSTS_PATH}/${createdPostId}`)
      .set('Authorization', adminToken)
      .expect(HttpStatus.NoContent_204);

    await request(app).get(`${SETTINGS.POSTS_PATH}/${createdPostId}`).expect(HttpStatus.NotFound_404);
  });
});
