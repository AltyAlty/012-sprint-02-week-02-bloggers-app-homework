import 'dotenv/config';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { SETTINGS } from '../../../src/core/settings/settings';
import { createBlog } from '../../utils/blogs/create-blog';
import { createPost } from '../../utils/posts/create-post';
import { getCreatePostInputDTO } from '../../utils/posts/get-create-post-input-dto';
import { BlogOutputDTO } from '../../../src/blogs/routes/output-dto/blog.output-dto';
import { CreatePostInputDTO } from '../../../src/posts/routes/input-dto/create-post.input-dto';
import { PostOutputDTO } from '../../../src/posts/routes/output-dto/post.output-dto';
import { getPostById } from '../../utils/posts/get-post-by-id';
import { createUser } from '../../utils/users/create-user';
import { loginUser } from '../../utils/auth/login-user';
import { CreateCommentInPostInputDTO } from '../../../src/comments/routes/input-dto/create-comment-in-post.input-dto';
import { createCommentInPost } from '../../utils/posts/create-comment-in-post';
import { doBeforeTests } from '../../utils/common/do-before-tests';
import { getPostsList } from '../../utils/posts/get-posts-list';
import { PaginatedPostsListOutputDTO } from '../../../src/posts/routes/output-dto/paginated-posts-list.output-dto';
import { updatePostById } from '../../utils/posts/update-post-by-id';
import { deletePostById } from '../../utils/posts/delete-post-by-id';
import { getCommentsListByPostId } from '../../utils/posts/get-comments-list-by-post-id';
import { CreateUserInputDTO } from '../../../src/users/routes/input-dto/create-user.input-dto';
import { getCreateUserInputDTO } from '../../utils/users/get-create-user-input-dto';
import { PaginatedCommentsListOutputDTO } from '../../../src/comments/routes/output-dto/paginated-comments-list.output-dto';
import { UpdatePostInputDTO } from '../../../src/posts/routes/input-dto/update-post.input-dto';
import { getUpdatePostInputDTO } from '../../utils/posts/get-update-post-input-dto';

describe('Posts API validation', () => {
  const app = doBeforeTests();

  it('❌ 001 should not create a post without proper basic authorization; POST /api/posts', async () => {
    await createPost(app, undefined, undefined, HttpStatuses.Unauthorized_401, 'token');
    const getPostsListResponse: PaginatedPostsListOutputDTO = await getPostsList(app);

    expect(getPostsListResponse.items).toBeInstanceOf(Array);
    expect(getPostsListResponse.items.length).toBe(0);
    expect(getPostsListResponse.totalCount).toBe(0);
  });

  it('❌ 002 should not create a post when incorrect body passed; POST /api/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const correctCreatePostData: CreatePostInputDTO = getCreatePostInputDTO(createdBlogId);
    const incorrectTitle_01: string = '';
    const incorrectTitle_02: string = '   ';
    const incorrectTitle_03: string = '0123456789012345678901234567890';
    const incorrectTitle_04: string = '012345678901234567890123456789000000';
    const incorrectTitle_05: null = null;
    const incorrectShortDescription_01: string = '';
    const incorrectShortDescription_02: string = '   ';
    const incorrectShortDescription_03: null = null;
    const incorrectContent_01: string = '';
    const incorrectContent_02: string = '   ';
    const incorrectContent_03: null = null;
    const incorrectBlogId_01: number = 2;
    const incorrectBlogId_02: null = null;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await createPost(app, { ...correctCreatePostData, title: incorrectTitle_01 }, createdBlogId, testStatus);
    await createPost(app, { ...correctCreatePostData, title: incorrectTitle_02 }, createdBlogId, testStatus);
    await createPost(app, { ...correctCreatePostData, title: incorrectTitle_03 }, createdBlogId, testStatus);
    await createPost(app, { ...correctCreatePostData, title: incorrectTitle_04 }, createdBlogId, testStatus);
    await createPost(app, { ...correctCreatePostData, title: incorrectTitle_05 }, createdBlogId, testStatus);

    await createPost(
      app,
      { ...correctCreatePostData, shortDescription: incorrectShortDescription_01 },
      createdBlogId,
      testStatus
    );

    await createPost(
      app,
      { ...correctCreatePostData, shortDescription: incorrectShortDescription_02 },
      createdBlogId,
      testStatus
    );

    await createPost(
      app,
      { ...correctCreatePostData, shortDescription: incorrectShortDescription_03 },
      createdBlogId,
      testStatus
    );

    await createPost(app, { ...correctCreatePostData, content: incorrectContent_01 }, createdBlogId, testStatus);
    await createPost(app, { ...correctCreatePostData, content: incorrectContent_02 }, createdBlogId, testStatus);
    await createPost(app, { ...correctCreatePostData, content: incorrectContent_03 }, createdBlogId, testStatus);
    await createPost(app, { ...correctCreatePostData, blogId: incorrectBlogId_01 }, createdBlogId, testStatus);
    await createPost(app, { ...correctCreatePostData, blogId: incorrectBlogId_02 }, createdBlogId, testStatus);
    const getPostsListResponse: PaginatedPostsListOutputDTO = await getPostsList(app);

    expect(getPostsListResponse.items).toBeInstanceOf(Array);
    expect(getPostsListResponse.items.length).toBe(0);
    expect(getPostsListResponse.totalCount).toBe(0);
  });

  it('❌ 003 should not return a post by incorrect ID; GET /api/posts/:id', async () => {
    const incorrectPostId_01: string = 'ABC';
    const incorrectPostId_02: number = 2;
    const incorrectPostId_03: null = null;
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await getPostById(app, incorrectPostId_01, testStatus);
    await getPostById(app, incorrectPostId_02, testStatus);
    await getPostById(app, incorrectPostId_03, testStatus);

    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);
    expect(getPostByIdResponse).toEqual(createdPost);
  });

  it('❌ 004 should not return a list of posts when incorrect pagination settings passed; GET /api/posts', async () => {
    const correctPageSize: number = 5;
    const correctPageNumber: number = 1;
    const correctSortDirection: string = 'asc';
    const correctSortBy: string = 'title';
    const correctUrl: string = `${SETTINGS.POSTS_PATH}?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectPageSize: number = 101;
    const incorrectPageNumber: number = -1;
    const incorrectSortDirection: string = 'cas';
    const incorrectSortBy: string = 'description';
    const incorrectUrl_01: string = `${SETTINGS.POSTS_PATH}?pageSize=${incorrectPageSize}&pageNumber=${correctPageNumber}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_02: string = `${SETTINGS.POSTS_PATH}?pageSize=${correctPageSize}&pageNumber=${incorrectPageNumber}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_03: string = `${SETTINGS.POSTS_PATH}?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&sortDirection=${incorrectSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_04: string = `${SETTINGS.POSTS_PATH}?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&sortDirection=${correctSortDirection}&sortBy=${incorrectSortBy}`;
    await Promise.all([createPost(app), createPost(app)]);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await getPostsList(app, incorrectUrl_01, testStatus);
    await getPostsList(app, incorrectUrl_02, testStatus);
    await getPostsList(app, incorrectUrl_03, testStatus);
    await getPostsList(app, incorrectUrl_04, testStatus);
    const getPostsListResponse: PaginatedPostsListOutputDTO = await getPostsList(app, correctUrl);

    expect(getPostsListResponse.items).toBeInstanceOf(Array);
    expect(getPostsListResponse.items.length).toBe(2);
    expect(getPostsListResponse.totalCount).toBe(2);
  });

  it('❌ 005 should not update a post by ID without proper basic authorization; PUT /api/posts/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const createdPost: PostOutputDTO = await createPost(app, undefined, createdBlogId);
    const createdPostId: string = createdPost.id;

    await updatePostById(app, createdPostId, createdBlogId, undefined, HttpStatuses.Unauthorized_401, 'token');
    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);

    expect(getPostByIdResponse).toEqual(createdPost);
  });

  it('❌ 006 should not update a post by incorrect ID; PUT /api/posts/:id', async () => {
    const incorrectPostId_01: string = 'ABC';
    const incorrectPostId_02: number = 2;
    const incorrectPostId_03: null = null;
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const createdPost: PostOutputDTO = await createPost(app, undefined, createdBlogId);
    const createdPostId: string = createdPost.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await updatePostById(app, incorrectPostId_01, createdBlogId, undefined, testStatus);
    await updatePostById(app, incorrectPostId_02, createdBlogId, undefined, testStatus);
    await updatePostById(app, incorrectPostId_03, createdBlogId, undefined, testStatus);
    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);

    expect(getPostByIdResponse).toEqual(createdPost);
  });

  it('❌ 007 should not update a post by ID when incorrect body passed; PUT /api/posts/:id', async () => {
    const incorrectTitle_01: string = '';
    const incorrectTitle_02: string = '   ';
    const incorrectTitle_03: string = '0123456789012345678901234567890';
    const incorrectTitle_04: string = '012345678901234567890123456789000000';
    const incorrectTitle_05: null = null;
    const incorrectShortDescription_01: string = '';
    const incorrectShortDescription_02: string = '   ';
    const incorrectShortDescription_03: null = null;
    const incorrectContent_01: string = '';
    const incorrectContent_02: string = '   ';
    const incorrectContent_03: null = null;
    const incorrectBlogId_01: number = 2;
    const incorrectBlogId_02: null = null;
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const correctUpdatePostData: UpdatePostInputDTO = getUpdatePostInputDTO(createdBlogId);
    const createdPost: PostOutputDTO = await createPost(app, undefined, createdBlogId);
    const createdPostId: string = createdPost.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { ...correctUpdatePostData, title: incorrectTitle_01 },
      testStatus
    );

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { ...correctUpdatePostData, title: incorrectTitle_02 },
      testStatus
    );

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { ...correctUpdatePostData, title: incorrectTitle_03 },
      testStatus
    );

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { ...correctUpdatePostData, title: incorrectTitle_04 },
      testStatus
    );

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { ...correctUpdatePostData, title: incorrectTitle_05 },
      testStatus
    );

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { ...correctUpdatePostData, shortDescription: incorrectShortDescription_01 },
      testStatus
    );

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { ...correctUpdatePostData, shortDescription: incorrectShortDescription_02 },
      testStatus
    );

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { ...correctUpdatePostData, shortDescription: incorrectShortDescription_03 },
      testStatus
    );

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { ...correctUpdatePostData, content: incorrectContent_01 },
      testStatus
    );

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { ...correctUpdatePostData, content: incorrectContent_02 },
      testStatus
    );

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { ...correctUpdatePostData, content: incorrectContent_03 },
      testStatus
    );

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { ...correctUpdatePostData, blogId: incorrectBlogId_01 },
      testStatus
    );

    await updatePostById(
      app,
      createdPostId,
      createdBlogId,
      { ...correctUpdatePostData, blogId: incorrectBlogId_02 },
      testStatus
    );

    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);

    expect(getPostByIdResponse).toEqual(createdPost);
  });

  it('❌ 008 should not delete a post by ID without proper basic authorization; DELETE /api/posts/:id', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    await deletePostById(app, createdPostId, HttpStatuses.Unauthorized_401, 'token');
    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);

    expect(getPostByIdResponse).toEqual(createdPost);
  });

  it('❌ 009 should not delete a post by incorrect ID; DELETE /api/posts/:id', async () => {
    const incorrectPostId_01: string = 'ABC';
    const incorrectPostId_02: number = 2;
    const incorrectPostId_03: null = null;
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await deletePostById(app, incorrectPostId_01, testStatus);
    await deletePostById(app, incorrectPostId_02, testStatus);
    await deletePostById(app, incorrectPostId_03, testStatus);
    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostId);

    expect(getPostByIdResponse).toEqual(createdPost);
  });

  it('❌ 010 should not create a comment for a post by ID without proper access token; POST /api/posts/:postId/comments', async () => {
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;

    await createCommentInPost(app, createdPostId, 'token', undefined, HttpStatuses.Unauthorized_401);

    const getCommentsListByPostIdResponse: PaginatedCommentsListOutputDTO = await getCommentsListByPostId(
      app,
      createdPostId
    );

    expect(getCommentsListByPostIdResponse.items).toBeInstanceOf(Array);
    expect(getCommentsListByPostIdResponse.items.length).toBe(0);
    expect(getCommentsListByPostIdResponse.totalCount).toBe(0);
  });

  it('❌ 011 should not create a comment for a post by incorrect ID; POST /api/posts/:postId/comments', async () => {
    const incorrectPostId_01: string = '   ';
    const incorrectPostId_02: string = 'ABC';
    const incorrectPostId_03: number = 2;
    const incorrectPostId_04: null = null;
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUser(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await createCommentInPost(app, incorrectPostId_01, accessToken, undefined, testStatus);
    await createCommentInPost(app, incorrectPostId_02, accessToken, undefined, testStatus);
    await createCommentInPost(app, incorrectPostId_03, accessToken, undefined, testStatus);
    await createCommentInPost(app, incorrectPostId_04, accessToken, undefined, testStatus);

    const getCommentsListByPostIdResponse: PaginatedCommentsListOutputDTO = await getCommentsListByPostId(
      app,
      createdPostId
    );

    expect(getCommentsListByPostIdResponse.items).toBeInstanceOf(Array);
    expect(getCommentsListByPostIdResponse.items.length).toBe(0);
    expect(getCommentsListByPostIdResponse.totalCount).toBe(0);
  });

  it('❌ 012 should not create a comment for a post by ID when incorrect body passed; POST /api/posts/:postId/comments', async () => {
    const incorrectCreateCommentInPostData_01: CreateCommentInPostInputDTO = { content: 'qwe123zxc' };
    const incorrectCreateCommentInPostData_02: CreateCommentInPostInputDTO = { content: '' };
    const incorrectCreateCommentInPostData_03: CreateCommentInPostInputDTO = { content: '   ' };
    const incorrectCreateCommentInPostData_04: CreateCommentInPostInputDTO = { content: 'ABC' };
    const incorrectCreateCommentInPostData_05: CreateCommentInPostInputDTO = { content: '1234567890' };
    const incorrectCreateCommentInPostData_06: { content: [] } = { content: [] };
    const incorrectCreateCommentInPostData_07: { content: {} } = { content: {} };
    const incorrectCreateCommentInPostData_08: { content: null } = { content: null };
    const incorrectCreateCommentInPostData_09: { content: undefined } = { content: undefined };
    const incorrectCreateCommentInPostData_10: { content: number } = { content: 1234567890 };
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const createUserData: CreateUserInputDTO = getCreateUserInputDTO();
    await createUser(app, createUserData);

    const accessToken: string = await loginUser(app, {
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });

    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await createCommentInPost(app, createdPostId, accessToken, incorrectCreateCommentInPostData_01, testStatus);
    await createCommentInPost(app, createdPostId, accessToken, incorrectCreateCommentInPostData_02, testStatus);
    await createCommentInPost(app, createdPostId, accessToken, incorrectCreateCommentInPostData_03, testStatus);
    await createCommentInPost(app, createdPostId, accessToken, incorrectCreateCommentInPostData_04, testStatus);
    await createCommentInPost(app, createdPostId, accessToken, incorrectCreateCommentInPostData_05, testStatus);
    await createCommentInPost(app, createdPostId, accessToken, incorrectCreateCommentInPostData_06, testStatus);
    await createCommentInPost(app, createdPostId, accessToken, incorrectCreateCommentInPostData_07, testStatus);
    await createCommentInPost(app, createdPostId, accessToken, incorrectCreateCommentInPostData_08, testStatus);
    await createCommentInPost(app, createdPostId, accessToken, incorrectCreateCommentInPostData_09, testStatus);
    await createCommentInPost(app, createdPostId, accessToken, incorrectCreateCommentInPostData_10, testStatus);

    const getCommentsListByPostIdResponse: PaginatedCommentsListOutputDTO = await getCommentsListByPostId(
      app,
      createdPostId
    );

    expect(getCommentsListByPostIdResponse.items).toBeInstanceOf(Array);
    expect(getCommentsListByPostIdResponse.items.length).toBe(0);
    expect(getCommentsListByPostIdResponse.totalCount).toBe(0);
  });

  it('❌ 013 should not return a list of comments for a post by incorrect ID; GET /api/posts/:postId/comments', async () => {
    const incorrectPostId_01: string = '   ';
    const incorrectPostId_02: string = 'ABC';
    const incorrectPostId_03: number = 2;
    const incorrectPostId_04: null = null;
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

    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await getCommentsListByPostId(app, incorrectPostId_01, undefined, testStatus);
    await getCommentsListByPostId(app, incorrectPostId_02, undefined, testStatus);
    await getCommentsListByPostId(app, incorrectPostId_03, undefined, testStatus);
    await getCommentsListByPostId(app, incorrectPostId_04, undefined, testStatus);

    const getCommentsListByPostIdResponse: PaginatedCommentsListOutputDTO = await getCommentsListByPostId(
      app,
      createdPostId
    );

    expect(getCommentsListByPostIdResponse.items).toBeInstanceOf(Array);
    expect(getCommentsListByPostIdResponse.items.length).toBe(2);
    expect(getCommentsListByPostIdResponse.totalCount).toBe(2);
  });

  it('❌ 014 should not return a list of comments for a post by ID when incorrect pagination settings passed; GET /api/posts/:postId/comments', async () => {
    const correctPageSize: number = 5;
    const correctPageNumber: number = 1;
    const correctSortDirection: string = 'asc';
    const correctSortBy: string = 'content';
    const createdPost: PostOutputDTO = await createPost(app);
    const createdPostId: string = createdPost.id;
    const correctUrl: string = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectPageSize: number = 101;
    const incorrectPageNumber: number = -1;
    const incorrectSortDirection: string = 'cas';
    const incorrectSortBy: string = 'description';
    const incorrectUrl_01: string = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${incorrectPageSize}&pageNumber=${correctPageNumber}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_02: string = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${correctPageSize}&pageNumber=${incorrectPageNumber}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_03: string = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&sortDirection=${incorrectSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_04: string = `${SETTINGS.POSTS_PATH}/${createdPostId}/comments?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&sortDirection=${correctSortDirection}&sortBy=${incorrectSortBy}`;
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

    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await getCommentsListByPostId(app, createdPostId, incorrectUrl_01, testStatus);
    await getCommentsListByPostId(app, createdPostId, incorrectUrl_02, testStatus);
    await getCommentsListByPostId(app, createdPostId, incorrectUrl_03, testStatus);
    await getCommentsListByPostId(app, createdPostId, incorrectUrl_04, testStatus);

    const getCommentsListByPostIdResponse: PaginatedCommentsListOutputDTO = await getCommentsListByPostId(
      app,
      createdPostId,
      correctUrl
    );

    expect(getCommentsListByPostIdResponse.items).toBeInstanceOf(Array);
    expect(getCommentsListByPostIdResponse.items.length).toBe(5);
    expect(getCommentsListByPostIdResponse.totalCount).toBe(6);
  });
});
