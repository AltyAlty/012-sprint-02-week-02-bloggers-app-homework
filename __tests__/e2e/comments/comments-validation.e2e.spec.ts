import 'dotenv/config';
import { PostOutputDTO } from '../../../src/posts/routes/output-dto/post.output-dto';
import { createPost } from '../../utils/posts/create-post';
import { createUser } from '../../utils/users/create-user';
import { loginUser } from '../../utils/auth/login-user';
import { CommentOutputDTO } from '../../../src/comments/routes/output-dto/comment.output-dto';
import { createCommentInPost } from '../../utils/posts/create-comment-in-post';
import { getCommentById } from '../../utils/comments/get-comment-by-id';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { UpdateCommentInputDTO } from '../../../src/comments/routes/input-dto/update-comment.input-dto';
import { updateCommentById } from '../../utils/comments/update-comment-by-id';
import { getUpdateCommentInputDTO } from '../../utils/comments/get-update-comment-input-dto';
import { doBeforeTests } from '../../utils/common/do-before-tests';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { getCreateUserInputDTO } from '../../utils/users/get-create-user-input-dto';
import { deleteCommentById } from '../../utils/comments/delete-comment-by-id';

describe('Comments API', () => {
  const app = doBeforeTests();

  it("❌ 001 should not return a comment by incorrect ID; GET /api/comments/:id'", async () => {
    const incorrectCommentId_01: string = 'ABC';
    const incorrectCommentId_02: number = 2;
    const incorrectCommentId_03: null = null;
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUser(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const createdComment: CommentOutputDTO = await createCommentInPost(app, createdPostId, accessToken);
    const createdCommentId: string = createdComment.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await getCommentById(app, incorrectCommentId_01, testStatus);
    await getCommentById(app, incorrectCommentId_02, testStatus);
    await getCommentById(app, incorrectCommentId_03, testStatus);
    const getCommentByIdResponse: CommentOutputDTO = await getCommentById(app, createdCommentId);

    expect(getCommentByIdResponse).toEqual(createdComment);
  });

  it('❌ 002 should not update a comment by ID without proper access token; PUT /api/comments/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const updateCommentData: UpdateCommentInputDTO = getUpdateCommentInputDTO();
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUser(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const createdComment: CommentOutputDTO = await createCommentInPost(app, createdPostId, accessToken);
    const createdCommentId: string = createdComment.id;

    await updateCommentById(app, createdCommentId, 'token', updateCommentData, HttpStatuses.Unauthorized_401);
    const getCommentByIdResponse: CommentOutputDTO = await getCommentById(app, createdCommentId);

    expect(getCommentByIdResponse).toEqual(createdComment);
  });

  it('❌ 003 should not update a comment by incorrect ID; PUT /api/comments/:id', async () => {
    const incorrectCommentId_01: string = 'ABC';
    const incorrectCommentId_02: number = 2;
    const incorrectCommentId_03: null = null;
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const updateCommentData: UpdateCommentInputDTO = getUpdateCommentInputDTO();
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUser(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const createdComment: CommentOutputDTO = await createCommentInPost(app, createdPostId, accessToken);
    const createdCommentId: string = createdComment.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await updateCommentById(app, incorrectCommentId_01, accessToken, updateCommentData, testStatus);
    await updateCommentById(app, incorrectCommentId_02, accessToken, updateCommentData, testStatus);
    await updateCommentById(app, incorrectCommentId_03, accessToken, updateCommentData, testStatus);
    const getCommentByIdResponse: CommentOutputDTO = await getCommentById(app, createdCommentId);

    expect(getCommentByIdResponse).toEqual(createdComment);
  });

  it('❌ 004 should not update a comment by ID when incorrect body passed; PUT /api/comments/:id', async () => {
    const incorrectUpdateCommentData_01: UpdateCommentInputDTO = { content: 'qwe123zxc' };
    const incorrectUpdateCommentData_02: UpdateCommentInputDTO = { content: '' };
    const incorrectUpdateCommentData_03: UpdateCommentInputDTO = { content: '   ' };
    const incorrectUpdateCommentData_04: UpdateCommentInputDTO = { content: 'ABC' };
    const incorrectUpdateCommentData_05: UpdateCommentInputDTO = { content: '1234567890' };
    const incorrectUpdateCommentData_06: { content: [] } = { content: [] };
    const incorrectUpdateCommentData_07: { content: {} } = { content: {} };
    const incorrectUpdateCommentData_08: { content: null } = { content: null };
    const incorrectUpdateCommentData_09: { content: undefined } = { content: undefined };
    const incorrectUpdateCommentData_10: { content: number } = { content: 1234567890 };
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUser(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const createdComment: CommentOutputDTO = await createCommentInPost(app, createdPostId, accessToken);
    const createdCommentId: string = createdComment.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await updateCommentById(app, createdCommentId, accessToken, incorrectUpdateCommentData_01, testStatus);
    await updateCommentById(app, createdCommentId, accessToken, incorrectUpdateCommentData_02, testStatus);
    await updateCommentById(app, createdCommentId, accessToken, incorrectUpdateCommentData_03, testStatus);
    await updateCommentById(app, createdCommentId, accessToken, incorrectUpdateCommentData_04, testStatus);
    await updateCommentById(app, createdCommentId, accessToken, incorrectUpdateCommentData_05, testStatus);
    await updateCommentById(app, createdCommentId, accessToken, incorrectUpdateCommentData_06, testStatus);
    await updateCommentById(app, createdCommentId, accessToken, incorrectUpdateCommentData_07, testStatus);
    await updateCommentById(app, createdCommentId, accessToken, incorrectUpdateCommentData_08, testStatus);
    await updateCommentById(app, createdCommentId, accessToken, incorrectUpdateCommentData_09, testStatus);
    await updateCommentById(app, createdCommentId, accessToken, incorrectUpdateCommentData_10, testStatus);
    const getCommentByIdResponse: CommentOutputDTO = await getCommentById(app, createdCommentId);

    expect(getCommentByIdResponse).toEqual(createdComment);
  });

  it('❌ 005 should not delete a comment by ID without proper access token; DELETE /api/comments/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUser(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const createdComment: CommentOutputDTO = await createCommentInPost(app, createdPostId, accessToken);
    const createdCommentId: string = createdComment.id;

    await deleteCommentById(app, createdCommentId, 'token', HttpStatuses.Unauthorized_401);
    const getCommentByIdResponse: CommentOutputDTO = await getCommentById(app, createdCommentId);

    expect(getCommentByIdResponse).toEqual(createdComment);
  });

  it('❌ 006 should not delete a comment by incorrect ID; DELETE /api/comments/:id', async () => {
    const incorrectCommentId_01: string = 'ABC';
    const incorrectCommentId_02: number = 2;
    const incorrectCommentId_03: null = null;
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUser(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const createdComment: CommentOutputDTO = await createCommentInPost(app, createdPostId, accessToken);
    const createdCommentId: string = createdComment.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await deleteCommentById(app, incorrectCommentId_01, accessToken, testStatus);
    await deleteCommentById(app, incorrectCommentId_02, accessToken, testStatus);
    await deleteCommentById(app, incorrectCommentId_03, accessToken, testStatus);
    const getCommentByIdResponse: CommentOutputDTO = await getCommentById(app, createdCommentId);

    expect(getCommentByIdResponse).toEqual(createdComment);
  });
});
