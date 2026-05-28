import 'dotenv/config';
import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { generateBasicAuthToken } from '../../utils/auth/generate-admin-auth-token';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
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
import { loginUser } from '../../utils/auth/login-user';
import { createCommentInPost } from '../../utils/comments/create-comment-in-post';
import { CreateCommentInPostInputDTO } from '../../../src/comments/routes/input-dto/create-comment-in-post.input-dto';
import { CommentOutputDTO } from '../../../src/comments/routes/output-dto/comment.output-dto';
import { createUser } from '../../utils/users/create-user';
import { UserOutputDTO } from '../../../src/users/routes/output-dto/user.output-dto';

describe('Posts API', () => {
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
    const getPostsListResponse = await request(app).get(SETTINGS.POSTS_PATH).expect(HttpStatuses.Ok_200);
    expect(getPostsListResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListResponse.body.items.length).toBe(1);
    expect(getPostsListResponse.body.totalCount).toBe(1);
    expect(getPostsListResponse.body.items[0]).toEqual({ ...createdPost });
  });

  it('✅ 002 should return a list of posts; GET /api/posts', async () => {
    await Promise.all([createPost(app), createPost(app)]);
    const getPostsListResponse = await request(app).get(SETTINGS.POSTS_PATH).expect(HttpStatuses.Ok_200);
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
      .expect(HttpStatuses.Ok_200);

    expect(getPostsListResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListResponse.body.items.length).toBe(5);
    expect(getPostsListResponse.body.totalCount).toBe(6);
  });

  it('✅ 004 should return a post specified by ID; GET /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);
    expect(getPostByIdResponse).toEqual({ ...createdPost });
  });

  it('✅ 005 should update a post specified by ID; PUT /api/posts/:id', async () => {
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

  it('✅ 006 should delete a post specified by ID; DELETE /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    await request(app)
      .delete(`${SETTINGS.POSTS_PATH}/${createdPostId}`)
      .set('Authorization', adminToken)
      .expect(HttpStatuses.NoContent_204);

    await request(app).get(`${SETTINGS.POSTS_PATH}/${createdPostId}`).expect(HttpStatuses.NotFound_404);
  });

  it('✅ 007 should create a comment in a post specified by ID; POST /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const credentials01 = { login: 'user02', password: 'password789', email: 'user02@example.ru' };
    const createdUser01: UserOutputDTO = await createUser(app, credentials01);
    const loginResponse = await loginUser(app, { loginOrEmail: credentials01.login, password: credentials01.password });
    const accessToken: string = loginResponse.accessToken;
    const createCommentDTO: CreateCommentInPostInputDTO = { content: 'some comment content 002' };

    const createdComment: CommentOutputDTO = await createCommentInPost(
      app,
      createdPostId,
      accessToken,
      createCommentDTO
    );

    expect(createdComment.content).toEqual(createCommentDTO.content);
    expect(createdComment.commentatorInfo.userLogin).toEqual(createdUser01.login);
    expect(createdComment.commentatorInfo.userId).toEqual(createdUser01.id);
  });

  it('✅ 008 should return a list of comments in a post specified by ID; GET /api/posts/:postId/comments', async () => {
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

    const getCommentsListResponse = await request(app)
      .get(`${SETTINGS.POSTS_PATH}/${createdPostId}/comments`)
      .expect(HttpStatuses.Ok_200);

    expect(getCommentsListResponse.body.items).toBeInstanceOf(Array);
    expect(getCommentsListResponse.body.items.length).toBe(10);
    expect(getCommentsListResponse.body.totalCount).toBe(11);
  });
});
