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
import { createUser } from '../../utils/users/create-user';
import { loginUser } from '../../utils/auth/login-user';
import { CreateCommentInPostInputDTO } from '../../../src/comments/routes/input-dto/create-comment-in-post.input-dto';
import { CommentOutputDTO } from '../../../src/comments/routes/output-dto/comment.output-dto';
import { createCommentInPost } from '../../utils/comments/create-comment-in-post';

describe('Posts API validation', () => {
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

  it('❌ 010 should not create a comment in a post specified by ID without proper access token; POST /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const credentials01 = { login: 'user01', password: 'password123', email: 'user01@example.ru' };
    await createUser(app, credentials01);
    const loginResponse = await loginUser(app, { loginOrEmail: credentials01.login, password: credentials01.password });
    const correctAccessToken: string = loginResponse.accessToken;
    const incorrectAccessToken01: string = `${loginResponse.accessToken}123`;
    const incorrectAccessToken02: string = ``;
    const incorrectAccessToken03: string = `zxc123ert`;
    const incorrectAccessToken04: null = null;
    const incorrectAccessToken05: number = 123456789;
    const correctCreateCommentDTO01: CreateCommentInPostInputDTO = { content: 'some comment content 001' };
    const correctCreateCommentDTO02: CreateCommentInPostInputDTO = { content: 'some comment content 002' };

    const checkCommentCreating = async (accessToken: string | number | null) => {
      await request(app)
        .post(`${SETTINGS.POSTS_PATH}/${createdPostId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(correctCreateCommentDTO01)
        .expect(HttpStatuses.Unauthorized_401);
    };

    await checkCommentCreating(incorrectAccessToken01);
    await checkCommentCreating(incorrectAccessToken02);
    await checkCommentCreating(incorrectAccessToken03);
    await checkCommentCreating(incorrectAccessToken04);
    await checkCommentCreating(incorrectAccessToken05);

    const createdComment: CommentOutputDTO = await createCommentInPost(
      app,
      createdPostId,
      correctAccessToken,
      correctCreateCommentDTO02
    );

    expect(createdComment.content).toEqual(correctCreateCommentDTO02.content);
  });

  it('❌ 011 should not create a comment in a post specified by incorrect ID; POST /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const incorrectPostId01: string = `${createdPost.id}123`;
    const incorrectPostId02: string = `zxc123ert`;
    const incorrectPostId03: null = null;
    const incorrectPostId04: number = 123456789;
    const credentials01 = { login: 'user01', password: 'password123', email: 'user01@example.ru' };
    await createUser(app, credentials01);
    const loginResponse = await loginUser(app, { loginOrEmail: credentials01.login, password: credentials01.password });
    const correctAccessToken: string = loginResponse.accessToken;
    const correctCreateCommentDTO01: CreateCommentInPostInputDTO = { content: 'some comment content 001' };
    const correctCreateCommentDTO02: CreateCommentInPostInputDTO = { content: 'some comment content 002' };

    const checkCommentCreating = async (postId: string | number | null) => {
      await request(app)
        .post(`${SETTINGS.POSTS_PATH}/${postId}/comments`)
        .set('Authorization', `Bearer ${correctAccessToken}`)
        .send(correctCreateCommentDTO01)
        .expect(HttpStatuses.BadRequest_400);
    };

    await checkCommentCreating(incorrectPostId01);
    await checkCommentCreating(incorrectPostId02);
    await checkCommentCreating(incorrectPostId03);
    await checkCommentCreating(incorrectPostId04);

    const createdComment: CommentOutputDTO = await createCommentInPost(
      app,
      createdPostId,
      correctAccessToken,
      correctCreateCommentDTO02
    );

    expect(createdComment.content).toEqual(correctCreateCommentDTO02.content);
  });

  it('❌ 012 should not create a comment in a post specified by ID when incorrect body passed; POST /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const credentials01 = { login: 'user01', password: 'password123', email: 'user01@example.ru' };
    await createUser(app, credentials01);
    const loginResponse = await loginUser(app, { loginOrEmail: credentials01.login, password: credentials01.password });
    const correctAccessToken: string = loginResponse.accessToken;
    const correctCreateCommentDTO: CreateCommentInPostInputDTO = { content: 'some comment content 001' };
    const incorrectCreateCommentDTO01 = { text: 'some comment content 001' };
    const incorrectCreateCommentDTO02 = { content: 'zxc123ert' };
    const incorrectCreateCommentDTO03 = { content: null };
    const incorrectCreateCommentDTO04 = { content: 123456789 };
    const incorrectCreateCommentDTO05 = 'some comment content 001';
    const incorrectCreateCommentDTO06 = undefined;
    const incorrectCreateCommentDTO07 = null;
    const incorrectCreateCommentDTO08 = '123456789';

    const checkCommentCreating = async (createCommentDTO: any) => {
      await request(app)
        .post(`${SETTINGS.POSTS_PATH}/${createdPostId}/comments`)
        .set('Authorization', `Bearer ${correctAccessToken}`)
        .send(createCommentDTO)
        .expect(HttpStatuses.BadRequest_400);
    };

    await checkCommentCreating(incorrectCreateCommentDTO01);
    await checkCommentCreating(incorrectCreateCommentDTO02);
    await checkCommentCreating(incorrectCreateCommentDTO03);
    await checkCommentCreating(incorrectCreateCommentDTO04);
    await checkCommentCreating(incorrectCreateCommentDTO05);
    await checkCommentCreating(incorrectCreateCommentDTO06);
    await checkCommentCreating(incorrectCreateCommentDTO07);
    await checkCommentCreating(incorrectCreateCommentDTO08);

    const createdComment: CommentOutputDTO = await createCommentInPost(
      app,
      createdPostId,
      correctAccessToken,
      correctCreateCommentDTO
    );

    expect(createdComment.content).toEqual(correctCreateCommentDTO.content);
  });

  it('❌ 013 should not return a list of comments in a post specified by incorrect ID; GET /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const incorrectPostId01: string = `${createdPost.id}123`;
    const incorrectPostId02: string = `zxc123ert`;
    const incorrectPostId03: null = null;
    const incorrectPostId04: number = 123456789;
    const credentials01 = { login: 'user02', password: 'password789', email: 'user02@example.ru' };
    await createUser(app, credentials01);
    const loginResponse = await loginUser(app, { loginOrEmail: credentials01.login, password: credentials01.password });
    const accessToken: string = loginResponse.accessToken;
    const createCommentDTO01: CreateCommentInPostInputDTO = { content: 'some comment content 001' };
    const createCommentDTO02: CreateCommentInPostInputDTO = { content: 'some comment content 002' };
    const createCommentDTO03: CreateCommentInPostInputDTO = { content: 'some comment content 003' };
    const createCommentDTO04: CreateCommentInPostInputDTO = { content: 'some comment content 004' };
    const createCommentDTO05: CreateCommentInPostInputDTO = { content: 'some comment content 005' };
    const createCommentDTO06: CreateCommentInPostInputDTO = { content: 'some comment content 006' };
    const createCommentDTO07: CreateCommentInPostInputDTO = { content: 'some comment content 007' };
    const createCommentDTO08: CreateCommentInPostInputDTO = { content: 'some comment content 008' };
    const createCommentDTO09: CreateCommentInPostInputDTO = { content: 'some comment content 009' };
    const createCommentDTO10: CreateCommentInPostInputDTO = { content: 'some comment content 010' };
    const createCommentDTO11: CreateCommentInPostInputDTO = { content: 'some comment content 011' };

    const createComment = async (createCommentDTO: CreateCommentInPostInputDTO): Promise<CommentOutputDTO> => {
      return await createCommentInPost(app, createdPostId, accessToken, createCommentDTO);
    };

    await Promise.all([
      createComment(createCommentDTO01),
      createComment(createCommentDTO02),
      createComment(createCommentDTO03),
      createComment(createCommentDTO04),
      createComment(createCommentDTO05),
      createComment(createCommentDTO06),
      createComment(createCommentDTO07),
      createComment(createCommentDTO08),
      createComment(createCommentDTO09),
      createComment(createCommentDTO10),
      createComment(createCommentDTO11),
    ]);

    await request(app).get(`${SETTINGS.POSTS_PATH}/${incorrectPostId01}/comments`).expect(HttpStatuses.BadRequest_400);
    await request(app).get(`${SETTINGS.POSTS_PATH}/${incorrectPostId02}/comments`).expect(HttpStatuses.BadRequest_400);
    await request(app).get(`${SETTINGS.POSTS_PATH}/${incorrectPostId03}/comments`).expect(HttpStatuses.BadRequest_400);
    await request(app).get(`${SETTINGS.POSTS_PATH}/${incorrectPostId04}/comments`).expect(HttpStatuses.BadRequest_400);

    const getCommentsListResponse = await request(app)
      .get(`${SETTINGS.POSTS_PATH}/${createdPostId}/comments`)
      .expect(HttpStatuses.Ok_200);

    expect(getCommentsListResponse.body.items).toBeInstanceOf(Array);
    expect(getCommentsListResponse.body.items.length).toBe(10);
    expect(getCommentsListResponse.body.totalCount).toBe(11);
  });

  it('❌ 014 should not return a list of comments in a post specified by ID when incorrect pagination settings passed; GET /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const credentials01 = { login: 'user02', password: 'password789', email: 'user02@example.ru' };
    await createUser(app, credentials01);
    const loginResponse = await loginUser(app, { loginOrEmail: credentials01.login, password: credentials01.password });
    const accessToken: string = loginResponse.accessToken;
    const createCommentDTO01: CreateCommentInPostInputDTO = { content: 'some comment content 001' };
    const createCommentDTO02: CreateCommentInPostInputDTO = { content: 'some comment content 002' };
    const createCommentDTO03: CreateCommentInPostInputDTO = { content: 'some comment content 003' };
    const createCommentDTO04: CreateCommentInPostInputDTO = { content: 'some comment content 004' };
    const createCommentDTO05: CreateCommentInPostInputDTO = { content: 'some comment content 005' };
    const createCommentDTO06: CreateCommentInPostInputDTO = { content: 'some comment content 006' };
    const createCommentDTO07: CreateCommentInPostInputDTO = { content: 'some comment content 007' };
    const createCommentDTO08: CreateCommentInPostInputDTO = { content: 'some comment content 008' };
    const createCommentDTO09: CreateCommentInPostInputDTO = { content: 'some comment content 009' };
    const createCommentDTO10: CreateCommentInPostInputDTO = { content: 'some comment content 010' };
    const createCommentDTO11: CreateCommentInPostInputDTO = { content: 'some comment content 011' };

    const pageSize = 5;
    const pageNumber = 1;
    const sortDirection = 'asc';
    const sortBy = 'content';
    const correctQuery = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;

    const incorrectPageSize = 101;
    const incorrectPageNumber = -1;
    const incorrectSortDirection = 'cas';
    const incorrectSortBy = 'description';
    const incorrectQuery1 = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${incorrectPageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;
    const incorrectQuery2 = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${pageSize}&pageNumber=${incorrectPageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;
    const incorrectQuery3 = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${incorrectSortDirection}&sortBy=${sortBy}`;
    const incorrectQuery4 = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${incorrectSortBy}`;

    const createComment = async (createCommentDTO: CreateCommentInPostInputDTO): Promise<CommentOutputDTO> => {
      return await createCommentInPost(app, createdPostId, accessToken, createCommentDTO);
    };

    await Promise.all([
      createComment(createCommentDTO01),
      createComment(createCommentDTO02),
      createComment(createCommentDTO03),
      createComment(createCommentDTO04),
      createComment(createCommentDTO05),
      createComment(createCommentDTO06),
      createComment(createCommentDTO07),
      createComment(createCommentDTO08),
      createComment(createCommentDTO09),
      createComment(createCommentDTO10),
      createComment(createCommentDTO11),
    ]);

    await request(app).get(incorrectQuery1).expect(HttpStatuses.BadRequest_400);
    await request(app).get(incorrectQuery2).expect(HttpStatuses.BadRequest_400);
    await request(app).get(incorrectQuery3).expect(HttpStatuses.BadRequest_400);
    await request(app).get(incorrectQuery4).expect(HttpStatuses.BadRequest_400);

    const getCommentsListResponse = await request(app).get(correctQuery).expect(HttpStatuses.Ok_200);

    expect(getCommentsListResponse.body.items).toBeInstanceOf(Array);
    expect(getCommentsListResponse.body.items.length).toBe(5);
    expect(getCommentsListResponse.body.totalCount).toBe(11);
  });
});
