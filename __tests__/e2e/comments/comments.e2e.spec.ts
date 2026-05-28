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
import { updateCommentById } from '../../utils/comments/update-comment-by-id';
import { UpdateCommentInputDTO } from '../../../src/comments/routes/input-dto/update-comment.input-dto';
import request from 'supertest';
import { HttpStatuses } from '../../../src/core/types/http-statuses';

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

  it('✅ 001 should return a comment specified by ID; GET /api/comments/:id', async () => {
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

    const getCommentResponse: CommentOutputDTO = await getCommentById(app, createdComment.id);

    expect(getCommentResponse.id).toEqual(createdComment.id);
    expect(getCommentResponse.content).toEqual(createCommentDTO.content);
    expect(getCommentResponse.commentatorInfo.userLogin).toEqual(createdComment.commentatorInfo.userLogin);
    expect(getCommentResponse.commentatorInfo.userId).toEqual(createdComment.commentatorInfo.userId);
    expect(getCommentResponse.createdAt).toEqual(createdComment.createdAt);
  });

  it('✅ 002 should update a comment specified by ID; PUT /api/comments/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const credentials01 = { login: 'user02', password: 'password789', email: 'user02@example.ru' };
    await createUser(app, credentials01);
    const loginResponse = await loginUser(app, { loginOrEmail: credentials01.login, password: credentials01.password });
    const accessToken: string = loginResponse.accessToken;
    const createCommentDTO: CreateCommentInPostInputDTO = { content: 'some comment content 002' };
    const updateCommentDTO: UpdateCommentInputDTO = { content: 'some updated comment content 002' };

    const createdComment: CommentOutputDTO = await createCommentInPost(
      app,
      createdPostId,
      accessToken,
      createCommentDTO
    );

    await updateCommentById(app, createdComment.id, accessToken, updateCommentDTO);
    const getCommentResponse: CommentOutputDTO = await getCommentById(app, createdComment.id);
    expect(getCommentResponse.content).toEqual(updateCommentDTO.content);
  });

  it('✅ 003 should delete a comment specified by ID; DELETE /api/comments/:id', async () => {
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

    await request(app)
      .delete(`${SETTINGS.COMMENTS_PATH}/${createdComment.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatuses.NoContent_204);

    await request(app).get(`${SETTINGS.COMMENTS_PATH}/${createdComment.id}`).expect(HttpStatuses.NotFound_404);
  });
});
