import 'dotenv/config';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { SETTINGS } from '../../../src/core/settings/settings';
import { createPost } from '../../utils/posts/create-post';
import { PostOutputDTO } from '../../../src/posts/routes/output-dto/post.output-dto';
import { getPostById } from '../../utils/posts/get-post-by-id';
import { UpdatePostInputDTO } from '../../../src/posts/routes/input-dto/update-post.input-dto';
import { updatePostById } from '../../utils/posts/update-post-by-id';
import { getUpdatePostInputDTO } from '../../utils/posts/get-update-post-input-dto';
import { loginUser } from '../../utils/auth/login-user';
import { createCommentInPost } from '../../utils/posts/create-comment-in-post';
import { CommentOutputDTO } from '../../../src/comments/routes/output-dto/comment.output-dto';
import { createUser } from '../../utils/users/create-user';
import { getPostsList } from '../../utils/posts/get-posts-list';
import { doBeforeTests } from '../../utils/common/do-before-tests';
import { PaginatedPostsListOutputDTO } from '../../../src/posts/routes/output-dto/paginated-posts-list.output-dto';
import { deletePostById } from '../../utils/posts/delete-post-by-id';
import { getCreateUserInputDTO } from '../../utils/users/get-create-user-input-dto';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { getCommentById } from '../../utils/comments/get-comment-by-id';
import { getCommentsListByPostId } from '../../utils/posts/get-comments-list-by-post-id';
import { PaginatedCommentsListOutputDTO } from '../../../src/comments/routes/output-dto/paginated-comments-list.output-dto';

describe('Posts API', () => {
  const app = doBeforeTests();

  it('✅ 001 should create a post; POST /api/posts', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);

    expect(getPostByIdResponse).toEqual(createdPost);
  });

  it('✅ 002 should return a post by ID; GET /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);

    expect(getPostByIdResponse).toEqual(createdPost);
  });

  it('✅ 003 should return a list of posts; GET /api/posts', async () => {
    await Promise.all([createPost(app), createPost(app)]);

    const getPostsListResponse: PaginatedPostsListOutputDTO = await getPostsList(app);

    expect(getPostsListResponse.items).toBeInstanceOf(Array);
    expect(getPostsListResponse.items.length).toBe(2);
    expect(getPostsListResponse.totalCount).toBe(2);
  });

  it('✅ 004 should return a list of posts when correct pagination settings passed; GET /api/posts', async () => {
    const pageSize: number = 5;
    const pageNumber: number = 1;
    const sortDirection: string = 'asc';
    const sortBy: string = 'title';
    const url: string = `${SETTINGS.POSTS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;

    await Promise.all([
      createPost(app),
      createPost(app),
      createPost(app),
      createPost(app),
      createPost(app),
      createPost(app),
    ]);

    const getPostsListResponse: PaginatedPostsListOutputDTO = await getPostsList(app, url);

    expect(getPostsListResponse.items).toBeInstanceOf(Array);
    expect(getPostsListResponse.items.length).toBe(5);
    expect(getPostsListResponse.totalCount).toBe(6);
  });

  it('✅ 005 should update a post by ID; PUT /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const createdPostBlogId: string = createdPost.blogId;
    const updatePostData: UpdatePostInputDTO = getUpdatePostInputDTO(createdPostBlogId);

    await updatePostById(app, createdPostId, createdPostBlogId, updatePostData);
    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);

    expect(getPostByIdResponse).toEqual({
      id: createdPostId,
      title: updatePostData.title,
      shortDescription: updatePostData.shortDescription,
      content: updatePostData.content,
      blogId: createdPostBlogId,
      blogName: createdPost.blogName,
      createdAt: createdPost.createdAt,
    });
  });

  it('✅ 006 should delete a post by ID; DELETE /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    await deletePostById(app, createdPostId);
    await getPostById(app, createdPostId, HttpStatuses.NotFound_404);
  });

  it('✅ 007 should create a comment for a post by ID; POST /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    const createdUser = await createUser(app, createUserData);

    const accessToken: string = await loginUser(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const createdComment: CommentOutputDTO = await createCommentInPost(app, createdPostId, accessToken);
    const createdCommentId = createdComment.id;
    const getCommentByIdResponse: CommentOutputDTO = await getCommentById(app, createdCommentId);

    expect(getCommentByIdResponse).toEqual(createdComment);
    expect(getCommentByIdResponse.id).toBe(createdCommentId);
    expect(getCommentByIdResponse.commentatorInfo.userId).toBe(createdUser.id);
    expect(getCommentByIdResponse.commentatorInfo.userLogin).toBe(createdUser.login);
  });

  it('✅ 008 should return a list of comments for a post by ID; GET /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUser(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await Promise.all([
      createCommentInPost(app, createdPostId, accessToken),
      createCommentInPost(app, createdPostId, accessToken),
    ]);

    const getCommentsListByPostIdResponse: PaginatedCommentsListOutputDTO = await getCommentsListByPostId(
      app,
      createdPostId
    );

    expect(getCommentsListByPostIdResponse.items).toBeInstanceOf(Array);
    expect(getCommentsListByPostIdResponse.items.length).toBe(2);
    expect(getCommentsListByPostIdResponse.totalCount).toBe(2);
  });

  it('✅ 009 should return a list of comments for a post by ID when correct pagination settings passed; GET /api/posts/:postId/comments', async () => {
    const pageSize: number = 5;
    const pageNumber: number = 1;
    const sortDirection: string = 'asc';
    const sortBy: string = 'content';
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const url: string = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUser(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    await Promise.all([
      createCommentInPost(app, createdPostId, accessToken),
      createCommentInPost(app, createdPostId, accessToken),
      createCommentInPost(app, createdPostId, accessToken),
      createCommentInPost(app, createdPostId, accessToken),
      createCommentInPost(app, createdPostId, accessToken),
      createCommentInPost(app, createdPostId, accessToken),
    ]);

    const getCommentsListByPostIdResponse: PaginatedCommentsListOutputDTO = await getCommentsListByPostId(
      app,
      createdPostId,
      url
    );

    expect(getCommentsListByPostIdResponse.items).toBeInstanceOf(Array);
    expect(getCommentsListByPostIdResponse.items.length).toBe(5);
    expect(getCommentsListByPostIdResponse.totalCount).toBe(6);
  });
});
