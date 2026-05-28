import 'dotenv/config';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { generateBasicAuthToken } from '../../utils/auth/generate-admin-auth-token';
import { runDB, stopDb } from '../../../src/db/mongodb/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import { clearDb } from '../../utils/db/clear-db';
import { PostOutputDTO } from '../../../src/posts/routes/output-dto/post.output-dto';
import { createPost } from '../../utils/posts/create-post';
import { createUser } from '../../utils/users/create-user';
import { loginUser } from '../../utils/auth/login-user';
import { CreateCommentInPostInputDTO } from '../../../src/comments/routes/input-dto/create-comment-in-post.input-dto';
import { CommentOutputDTO } from '../../../src/comments/routes/output-dto/comment.output-dto';
import { createCommentInPost } from '../../utils/comments/create-comment-in-post';
import { getCommentById } from '../../utils/comments/get-comment-by-id';
import request from 'supertest';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { UpdateCommentInputDTO } from '../../../src/comments/routes/input-dto/update-comment.input-dto';
import { updateCommentById } from '../../utils/comments/update-comment-by-id';
import { getUpdateCommentInputDTO } from '../../utils/comments/get-update-comment-input-dto';
import { getCreateCommentInPostInputDTO } from '../../utils/comments/get-create-comment-in-post-input-dto';

describe('Comments API', () => {
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

  it("❌ 001 should not return a comment specified by incorrect ID; GET /api/comments/:id'", async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const credentials01 = { login: 'user02', password: 'password789', email: 'user02@example.ru' };
    await createUser(app, credentials01);
    const loginResponse = await loginUser(app, { loginOrEmail: credentials01.login, password: credentials01.password });
    const accessToken: string = loginResponse.accessToken;
    const createCommentDTO: CreateCommentInPostInputDTO = { content: 'some comment content 002' };

    const createdComment: CommentOutputDTO = await createCommentInPost(
      app,
      createdPostId,
      accessToken,
      createCommentDTO
    );

    const createdCommentId: string = createdComment.id;
    const incorrectCommentId01 = null;
    const incorrectCommentId02 = 'ABC';
    const incorrectCommentId03 = 2;
    const incorrectURL01 = `${SETTINGS.COMMENTS_PATH}/${incorrectCommentId01}`;
    const incorrectURL02 = `${SETTINGS.COMMENTS_PATH}/${incorrectCommentId02}`;
    const incorrectURL03 = `${SETTINGS.COMMENTS_PATH}/${incorrectCommentId03}`;

    await request(app).get(incorrectURL01).expect(HttpStatuses.BadRequest_400);
    await request(app).get(incorrectURL02).expect(HttpStatuses.BadRequest_400);
    await request(app).get(incorrectURL03).expect(HttpStatuses.BadRequest_400);

    const getCommentResponse: CommentOutputDTO = await getCommentById(app, createdCommentId);

    expect(getCommentResponse).toEqual({ ...createdComment });
  });

  it('❌ 002 should not update a comment specified by ID without proper access token; PUT /api/comments/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    const credentials01 = { login: 'user02', password: 'password789', email: 'user02@example.ru' };
    await createUser(app, credentials01);
    const loginResponse = await loginUser(app, { loginOrEmail: credentials01.login, password: credentials01.password });
    const correctAccessToken: string = loginResponse.accessToken;
    const incorrectAccessToken01: string = `${loginResponse.accessToken}123`;
    const incorrectAccessToken02: string = ``;
    const incorrectAccessToken03: string = `zxc123ert`;
    const incorrectAccessToken04: null = null;
    const incorrectAccessToken05: number = 123456789;

    const createCommentDTO: CreateCommentInPostInputDTO = { content: 'some comment content 002' };
    const updateCommentDTO01: UpdateCommentInputDTO = { content: 'some updated comment content 002' };
    const updateCommentDTO02: UpdateCommentInputDTO = getUpdateCommentInputDTO();

    const createdComment: CommentOutputDTO = await createCommentInPost(
      app,
      createdPostId,
      correctAccessToken,
      createCommentDTO
    );

    const createdCommentId: string = createdComment.id;

    const checkCommentUpdating = async (accessToken: string | number | null) => {
      await request(app)
        .put(`${SETTINGS.COMMENTS_PATH}/${createdCommentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateCommentDTO01)
        .expect(HttpStatuses.Unauthorized_401);
    };

    await checkCommentUpdating(incorrectAccessToken01);
    await checkCommentUpdating(incorrectAccessToken02);
    await checkCommentUpdating(incorrectAccessToken03);
    await checkCommentUpdating(incorrectAccessToken04);
    await checkCommentUpdating(incorrectAccessToken05);

    await updateCommentById(app, createdCommentId, correctAccessToken, updateCommentDTO02);
    const getCommentResponse: CommentOutputDTO = await getCommentById(app, createdCommentId);
    expect(getCommentResponse.content).toEqual(updateCommentDTO02.content);
  });

  it('❌ 003 should not update a comment specified by incorrect ID; PUT /api/comments/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    const credentials01 = { login: 'user02', password: 'password789', email: 'user02@example.ru' };
    await createUser(app, credentials01);
    const loginResponse = await loginUser(app, { loginOrEmail: credentials01.login, password: credentials01.password });
    const accessToken: string = loginResponse.accessToken;

    const createCommentDTO: CreateCommentInPostInputDTO = { content: 'some comment content 002' };
    const updateCommentDTO01: UpdateCommentInputDTO = { content: 'some updated comment content 002' };
    const updateCommentDTO02: UpdateCommentInputDTO = getUpdateCommentInputDTO();

    const createdComment: CommentOutputDTO = await createCommentInPost(
      app,
      createdPostId,
      accessToken,
      createCommentDTO
    );

    const createdCommentId: string = createdComment.id;

    const incorrectCommentId01: string = `${createdCommentId}123`;
    const incorrectCommentId02: string = `zxc123ert`;
    const incorrectCommentId03: null = null;
    const incorrectCommentId04: number = 123456789;

    const checkCommentUpdating = async (commentId: string | number | null) => {
      await request(app)
        .put(`${SETTINGS.COMMENTS_PATH}/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateCommentDTO01)
        .expect(HttpStatuses.BadRequest_400);
    };

    await checkCommentUpdating(incorrectCommentId01);
    await checkCommentUpdating(incorrectCommentId02);
    await checkCommentUpdating(incorrectCommentId03);
    await checkCommentUpdating(incorrectCommentId04);

    await updateCommentById(app, createdCommentId, accessToken, updateCommentDTO02);
    const getCommentResponse: CommentOutputDTO = await getCommentById(app, createdCommentId);
    expect(getCommentResponse.content).toEqual(updateCommentDTO02.content);
  });

  it('❌ 004 should not update a comment specified by ID when incorrect body passed; PUT /api/comments/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    const credentials01 = { login: 'user02', password: 'password789', email: 'user02@example.ru' };
    await createUser(app, credentials01);
    const loginResponse = await loginUser(app, { loginOrEmail: credentials01.login, password: credentials01.password });
    const accessToken: string = loginResponse.accessToken;

    const createCommentDTO: CreateCommentInPostInputDTO = { content: 'some comment content 002' };
    const correctUpdateCommentDTO: UpdateCommentInputDTO = { content: 'some updated comment content 002' };
    const incorrectUpdateCommentDTO01 = { text: 'some comment content 001' };
    const incorrectUpdateCommentDTO02 = { content: 'zxc123ert' };
    const incorrectUpdateCommentDTO03 = { content: null };
    const incorrectUpdateCommentDTO04 = { content: 123456789 };
    const incorrectUpdateCommentDTO05 = 'some comment content 001';
    const incorrectUpdateCommentDTO06 = undefined;
    const incorrectUpdateCommentDTO07 = null;
    const incorrectUpdateCommentDTO08 = '123456789';

    const createdComment: CommentOutputDTO = await createCommentInPost(
      app,
      createdPostId,
      accessToken,
      createCommentDTO
    );

    const createdCommentId: string = createdComment.id;

    const checkCommentUpdating = async (updateCommentDTO: any) => {
      await request(app)
        .put(`${SETTINGS.COMMENTS_PATH}/${createdCommentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateCommentDTO)
        .expect(HttpStatuses.BadRequest_400);
    };

    await checkCommentUpdating(incorrectUpdateCommentDTO01);
    await checkCommentUpdating(incorrectUpdateCommentDTO02);
    await checkCommentUpdating(incorrectUpdateCommentDTO03);
    await checkCommentUpdating(incorrectUpdateCommentDTO04);
    await checkCommentUpdating(incorrectUpdateCommentDTO05);
    await checkCommentUpdating(incorrectUpdateCommentDTO06);
    await checkCommentUpdating(incorrectUpdateCommentDTO07);
    await checkCommentUpdating(incorrectUpdateCommentDTO08);

    await updateCommentById(app, createdCommentId, accessToken, correctUpdateCommentDTO);
    const getCommentResponse: CommentOutputDTO = await getCommentById(app, createdCommentId);
    expect(getCommentResponse.content).toEqual(correctUpdateCommentDTO.content);
  });

  it('❌ 005 should not delete a comment specified by ID without proper access token; DELETE /api/comments/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    const credentials01 = { login: 'user02', password: 'password789', email: 'user02@example.ru' };
    await createUser(app, credentials01);
    const loginResponse = await loginUser(app, { loginOrEmail: credentials01.login, password: credentials01.password });
    const correctAccessToken: string = loginResponse.accessToken;
    const incorrectAccessToken01: string = `${loginResponse.accessToken}123`;
    const incorrectAccessToken02: string = ``;
    const incorrectAccessToken03: string = `zxc123ert`;
    const incorrectAccessToken04: null = null;
    const incorrectAccessToken05: number = 123456789;

    const createCommentDTO: CreateCommentInPostInputDTO = getCreateCommentInPostInputDTO();

    const createdComment: CommentOutputDTO = await createCommentInPost(
      app,
      createdPostId,
      correctAccessToken,
      createCommentDTO
    );

    const createdCommentId: string = createdComment.id;

    const checkCommentDeleting = async (accessToken: string | number | null) => {
      await request(app)
        .delete(`${SETTINGS.COMMENTS_PATH}/${createdCommentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatuses.Unauthorized_401);
    };

    await checkCommentDeleting(incorrectAccessToken01);
    await checkCommentDeleting(incorrectAccessToken02);
    await checkCommentDeleting(incorrectAccessToken03);
    await checkCommentDeleting(incorrectAccessToken04);
    await checkCommentDeleting(incorrectAccessToken05);

    const getCommentResponse: CommentOutputDTO = await getCommentById(app, createdCommentId);
    expect(getCommentResponse.content).toEqual(createCommentDTO.content);
  });

  it('❌ 006 should not delete a comment specified by incorrect ID; DELETE /api/comments/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    const credentials01 = { login: 'user02', password: 'password789', email: 'user02@example.ru' };
    await createUser(app, credentials01);
    const loginResponse = await loginUser(app, { loginOrEmail: credentials01.login, password: credentials01.password });
    const accessToken: string = loginResponse.accessToken;

    const createCommentDTO: CreateCommentInPostInputDTO = getCreateCommentInPostInputDTO();

    const createdComment: CommentOutputDTO = await createCommentInPost(
      app,
      createdPostId,
      accessToken,
      createCommentDTO
    );

    const createdCommentId: string = createdComment.id;

    const incorrectCommentId01: string = `${createdCommentId}123`;
    const incorrectCommentId02: string = `zxc123ert`;
    const incorrectCommentId03: null = null;
    const incorrectCommentId04: number = 123456789;

    const checkCommentUpdating = async (commentId: string | number | null) => {
      await request(app)
        .delete(`${SETTINGS.COMMENTS_PATH}/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatuses.BadRequest_400);
    };

    await checkCommentUpdating(incorrectCommentId01);
    await checkCommentUpdating(incorrectCommentId02);
    await checkCommentUpdating(incorrectCommentId03);
    await checkCommentUpdating(incorrectCommentId04);

    const getCommentResponse: CommentOutputDTO = await getCommentById(app, createdCommentId);
    expect(getCommentResponse.content).toEqual(createCommentDTO.content);
  });
});
