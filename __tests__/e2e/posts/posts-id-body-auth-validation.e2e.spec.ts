import 'dotenv/config';
import express from 'express';
import request from 'supertest';
import { setupApp } from '../../../src/setup-app';
import { generateBasicAuthToken } from '../../utils/auth/generate-admin-auth-token';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { clearDb } from '../../utils/db/clear-db';
import { runDB, stopDb } from '../../../src/db/mongodb/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import { createBlog } from '../../utils/blogs/create-blog';
import { createPost } from '../../utils/posts/create-post';
import { getCreatePostInputDTO } from '../../utils/posts/get-create-post-input-dto';
import { BlogOutputDTO } from '../../../src/blogs/routes/output-dto/blog.output-dto';
import { CreatePostInputDTO } from '../../../src/posts/routes/input-dto/create-post.input-dto';
import { PostOutputDTO } from '../../../src/posts/routes/output-dto/post.output-dto';
import { getPostById } from '../../utils/posts/get-post-by-id';
import { UpdatePostInputDTO } from '../../../src/posts/routes/input-dto/update-post.input-dto';
import { getUpdatePostInputDTO } from '../../utils/posts/get-update-post-input-dto';

describe('Posts API ID, body and auth validation checks', () => {
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

  it('❌ 001 should not return a list of posts when incorrect pagination settings passed; GET /api/posts', async () => {
    await Promise.all([createPost(app), createPost(app)]);
    const pageSize = 5;
    const pageNumber = 1;
    const sortDirection = 'asc';
    const sortBy = 'title';
    const correctQuery = `${SETTINGS.POSTS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;

    const incorrectPageSize = 101;
    const incorrectPageNumber = -1;
    const incorrectSortDirection = 'cas';
    const incorrectSortBy = 'description';
    const incorrectQuery1 = `${SETTINGS.POSTS_PATH}?pageSize=${incorrectPageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;
    const incorrectQuery2 = `${SETTINGS.POSTS_PATH}?pageSize=${pageSize}&pageNumber=${incorrectPageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;
    const incorrectQuery3 = `${SETTINGS.POSTS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${incorrectSortDirection}&sortBy=${sortBy}`;
    const incorrectQuery4 = `${SETTINGS.POSTS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${incorrectSortBy}`;

    await request(app).get(incorrectQuery1).expect(HttpStatuses.BadRequest_400);
    await request(app).get(incorrectQuery2).expect(HttpStatuses.BadRequest_400);
    await request(app).get(incorrectQuery3).expect(HttpStatuses.BadRequest_400);
    await request(app).get(incorrectQuery4).expect(HttpStatuses.BadRequest_400);

    const getPostsListResponse = await request(app).get(correctQuery).expect(HttpStatuses.Ok_200);
    expect(getPostsListResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListResponse.body.items.length).toBe(2);
    expect(getPostsListResponse.body.totalCount).toBe(2);
  });

  it('❌ 002 should not create a post without proper basic authorization; POST /api/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const correctCreatePostData: CreatePostInputDTO = getCreatePostInputDTO(createdBlogId);
    await request(app).post(SETTINGS.POSTS_PATH).send(correctCreatePostData).expect(HttpStatuses.Unauthorized_401);
    const getPostsListResponse = await request(app).get(SETTINGS.POSTS_PATH).expect(HttpStatuses.Ok_200);
    expect(getPostsListResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListResponse.body.items.length).toBe(0);
    expect(getPostsListResponse.body.totalCount).toBe(0);
  });

  it('❌ 003 should not create a post when incorrect body passed; POST /api/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const correctCreatePostData: CreatePostInputDTO = getCreatePostInputDTO(createdBlogId);

    const checkPostCreating = async (
      title = correctCreatePostData.title,
      shortDescription: string | null = correctCreatePostData.shortDescription,
      content: string | null = correctCreatePostData.content,
      blogId: string | null = correctCreatePostData.blogId
    ) => {
      await request(app)
        .post(SETTINGS.POSTS_PATH)
        .set('Authorization', adminToken)
        .send({ title, shortDescription, content, blogId })
        .expect(HttpStatuses.BadRequest_400);
    };

    await checkPostCreating('');
    await checkPostCreating('0123456789012345678901234567890');
    await checkPostCreating('012345678901234567890123456789000000');
    await checkPostCreating('   ');
    await checkPostCreating(undefined, '');
    await checkPostCreating(undefined, null);
    await checkPostCreating(undefined, '   ');
    await checkPostCreating(undefined, undefined, '');
    await checkPostCreating(undefined, undefined, null);
    await checkPostCreating(undefined, undefined, '   ');
    await checkPostCreating(undefined, undefined, undefined, '');
    await checkPostCreating(undefined, undefined, undefined, null);
    await checkPostCreating(undefined, undefined, undefined, '   ');

    const getPostsListResponse = await request(app).get(SETTINGS.POSTS_PATH).expect(HttpStatuses.Ok_200);
    expect(getPostsListResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListResponse.body.items.length).toBe(0);
    expect(getPostsListResponse.body.totalCount).toBe(0);
  });

  it('❌ 004 should not return a post specified by incorrect ID; GET /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    const incorrectPostId1 = null;
    const incorrectPostId2 = 'ABC';
    const incorrectPostId3 = 2;
    const incorrectURL1 = `${SETTINGS.POSTS_PATH}/${incorrectPostId1}`;
    const incorrectURL2 = `${SETTINGS.POSTS_PATH}/${incorrectPostId2}`;
    const incorrectURL3 = `${SETTINGS.POSTS_PATH}/${incorrectPostId3}`;

    await request(app).get(incorrectURL1).expect(HttpStatuses.BadRequest_400);
    await request(app).get(incorrectURL2).expect(HttpStatuses.BadRequest_400);
    await request(app).get(incorrectURL3).expect(HttpStatuses.BadRequest_400);

    const getPostByIdResponse = await getPostById(app, createdPostId);
    expect(getPostByIdResponse).toEqual({ ...createdPost });
  });

  it('❌ 005 should not update a post specified by ID without proper basic authorization; PUT /api/posts/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const createdPost: PostOutputDTO = await createPost(app, undefined, createdBlogId);
    const createdPostId: string = createdPost.id;
    const updatePostData: UpdatePostInputDTO = getUpdatePostInputDTO(createdBlogId);

    await request(app)
      .put(`${SETTINGS.POSTS_PATH}/${createdPostId}`)
      .send(updatePostData)
      .expect(HttpStatuses.Unauthorized_401);

    const getPostByIdResponse = await getPostById(app, createdPostId);

    expect(getPostByIdResponse).toEqual({
      id: createdPostId,
      title: createdPost.title,
      shortDescription: createdPost.shortDescription,
      content: createdPost.content,
      blogId: createdBlogId,
      blogName: createdBlog.name,
      createdAt: expect.any(String),
    });
  });

  it('❌ 006 should not update a post specified by incorrect ID; PUT /api/posts/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const createdPost: PostOutputDTO = await createPost(app, undefined, createdBlogId);
    const createdPostId: string = createdPost.id;
    const updatePostData: UpdatePostInputDTO = getUpdatePostInputDTO(createdBlogId);

    const incorrectPostId1 = null;
    const incorrectPostId2 = 'ABC';
    const incorrectPostId3 = 2;
    const incorrectURL1 = `${SETTINGS.POSTS_PATH}/${incorrectPostId1}`;
    const incorrectURL2 = `${SETTINGS.POSTS_PATH}/${incorrectPostId2}`;
    const incorrectURL3 = `${SETTINGS.POSTS_PATH}/${incorrectPostId3}`;

    const checkPostUpdating = async (url: string) => {
      await request(app)
        .put(url)
        .set('Authorization', adminToken)
        .send(updatePostData)
        .expect(HttpStatuses.BadRequest_400);
    };

    await checkPostUpdating(incorrectURL1);
    await checkPostUpdating(incorrectURL2);
    await checkPostUpdating(incorrectURL3);

    const getPostByIdResponse = await getPostById(app, createdPostId);

    expect(getPostByIdResponse).toEqual({
      id: createdPostId,
      title: createdPost.title,
      shortDescription: createdPost.shortDescription,
      content: createdPost.content,
      blogId: createdBlogId,
      blogName: createdBlog.name,
      createdAt: expect.any(String),
    });
  });

  it('❌ 007 should not update a post specified by ID when incorrect body passed; PUT /api/posts/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const createdPost: PostOutputDTO = await createPost(app, undefined, createdBlogId);
    const createdPostId: string = createdPost.id;
    const correctUpdatePostData: UpdatePostInputDTO = getUpdatePostInputDTO(createdBlogId);
    const correctURL = `${SETTINGS.POSTS_PATH}/${createdPostId}`;

    const checkPostUpdating = async (
      title = correctUpdatePostData.title,
      shortDescription: string | null = correctUpdatePostData.shortDescription,
      content: string | null = correctUpdatePostData.content,
      blogId: string | null = correctUpdatePostData.blogId
    ) => {
      await request(app)
        .put(correctURL)
        .set('Authorization', adminToken)
        .send({ title, shortDescription, content, blogId })
        .expect(HttpStatuses.BadRequest_400);
    };

    await checkPostUpdating('');
    await checkPostUpdating('0123456789012345678901234567890');
    await checkPostUpdating('012345678901234567890123456789000000');
    await checkPostUpdating('   ');
    await checkPostUpdating(undefined, '');
    await checkPostUpdating(undefined, null);
    await checkPostUpdating(undefined, '   ');
    await checkPostUpdating(undefined, undefined, '');
    await checkPostUpdating(undefined, undefined, null);
    await checkPostUpdating(undefined, undefined, '   ');
    await checkPostUpdating(undefined, undefined, undefined, '');
    await checkPostUpdating(undefined, undefined, undefined, null);
    await checkPostUpdating(undefined, undefined, undefined, '   ');

    const getPostByIdResponse = await getPostById(app, createdPostId);

    expect(getPostByIdResponse).toEqual({
      id: createdPostId,
      title: createdPost.title,
      shortDescription: createdPost.shortDescription,
      content: createdPost.content,
      blogId: createdBlogId,
      blogName: createdBlog.name,
      createdAt: expect.any(String),
    });
  });

  it('❌ 008 should not delete a post specified by ID without proper basic authorization; DELETE /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    await request(app).delete(`${SETTINGS.POSTS_PATH}/${createdPostId}`).expect(HttpStatuses.Unauthorized_401);
    const getPostByIdResponse = await getPostById(app, createdPostId);
    expect(getPostByIdResponse).toEqual({ ...createdPost });
  });

  it('❌ 009 should not delete a post specified by incorrect ID; DELETE /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    const incorrectPostId1 = null;
    const incorrectPostId2 = 'ABC';
    const incorrectPostId3 = 2;
    const incorrectURL1 = `${SETTINGS.POSTS_PATH}/${incorrectPostId1}`;
    const incorrectURL2 = `${SETTINGS.POSTS_PATH}/${incorrectPostId2}`;
    const incorrectURL3 = `${SETTINGS.POSTS_PATH}/${incorrectPostId3}`;

    await request(app).delete(incorrectURL1).set('Authorization', adminToken).expect(HttpStatuses.BadRequest_400);
    await request(app).delete(incorrectURL2).set('Authorization', adminToken).expect(HttpStatuses.BadRequest_400);
    await request(app).delete(incorrectURL3).set('Authorization', adminToken).expect(HttpStatuses.BadRequest_400);

    const getPostByIdResponse = await getPostById(app, createdPostId);
    expect(getPostByIdResponse).toEqual({ ...createdPost });
  });
});
