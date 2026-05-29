import 'dotenv/config';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { SETTINGS } from '../../../src/core/settings/settings';
import { createBlog } from '../../utils/blogs/create-blog';
import { getCreateBlogInputDTO } from '../../utils/blogs/get-create-blog-input-dto';
import { CreateBlogInputDTO } from '../../../src/blogs/routes/input-dto/create-blog.input-dto';
import { getBlogById } from '../../utils/blogs/get-blog-by-id';
import { UpdateBlogInputDTO } from '../../../src/blogs/routes/input-dto/update-blog.input-dto';
import { BlogOutputDTO } from '../../../src/blogs/routes/output-dto/blog.output-dto';
import { getUpdateBlogInputDTO } from '../../utils/blogs/get-update-blog-input-dto';
import { getBlogsList } from '../../utils/blogs/get-blogs-list';
import { getPostsListByBlogId } from '../../utils/blogs/get-posts-list-by-blog-id';
import { PaginatedPostsListOutputDTO } from '../../../src/posts/routes/output-dto/paginated-posts-list.output-dto';
import { PaginatedBlogsListOutputDTO } from '../../../src/blogs/routes/output-dto/paginated-blogs-list.output-dto';
import { createPostInBlog } from '../../utils/blogs/create-post-in-blog';
import { getCreatePostInBlogInputDTO } from '../../utils/blogs/get-create-post-in-blog-input-dto';
import { CreatePostInBlogInputDTO } from '../../../src/posts/routes/input-dto/create-post-in-blog.input-dto';
import { updateBlogById } from '../../utils/blogs/update-blog-by-id';
import { deleteBlogById } from '../../utils/blogs/delete-blog-by-id';
import { doBeforeTests } from '../../utils/common/do-before-tests';

describe('Blogs API validation', () => {
  const app = doBeforeTests();

  it('❌ 001 should not create a blog without proper basic authorization; POST /api/blogs', async () => {
    await createBlog(app, undefined, HttpStatuses.Unauthorized_401, 'token');
    const getBlogsListResponse: PaginatedBlogsListOutputDTO = await getBlogsList(app);

    expect(getBlogsListResponse.items).toBeInstanceOf(Array);
    expect(getBlogsListResponse.items.length).toBe(0);
    expect(getBlogsListResponse.totalCount).toBe(0);
  });

  it('❌ 002 should not create a blog when incorrect body passed; POST /api/blogs', async () => {
    const correctCreateBlogData: CreateBlogInputDTO = getCreateBlogInputDTO();
    const incorrectName_01: string = '';
    const incorrectName_02: string = '   ';
    const incorrectName_03: string = '0123456789111111';
    const incorrectName_04: null = null;
    const incorrectDescription_01: string = '';
    const incorrectDescription_02: string = '   ';
    const incorrectDescription_03: null = null;
    const incorrectWebsiteUrl_01: string = '';
    const incorrectWebsiteUrl_02: string = '   ';
    const incorrectWebsiteUrl_03: string = 'www.websiteurl01.com/blog-01';
    const incorrectWebsiteUrl_04: null = null;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await createBlog(app, { ...correctCreateBlogData, name: incorrectName_01 }, testStatus);
    await createBlog(app, { ...correctCreateBlogData, name: incorrectName_02 }, testStatus);
    await createBlog(app, { ...correctCreateBlogData, name: incorrectName_03 }, testStatus);
    await createBlog(app, { ...correctCreateBlogData, name: incorrectName_04 }, testStatus);
    await createBlog(app, { ...correctCreateBlogData, description: incorrectDescription_01 }, testStatus);
    await createBlog(app, { ...correctCreateBlogData, description: incorrectDescription_02 }, testStatus);
    await createBlog(app, { ...correctCreateBlogData, description: incorrectDescription_03 }, testStatus);
    await createBlog(app, { ...correctCreateBlogData, websiteUrl: incorrectWebsiteUrl_01 }, testStatus);
    await createBlog(app, { ...correctCreateBlogData, websiteUrl: incorrectWebsiteUrl_02 }, testStatus);
    await createBlog(app, { ...correctCreateBlogData, websiteUrl: incorrectWebsiteUrl_03 }, testStatus);
    await createBlog(app, { ...correctCreateBlogData, websiteUrl: incorrectWebsiteUrl_04 }, testStatus);
    const getBlogsListResponse: PaginatedBlogsListOutputDTO = await getBlogsList(app);

    expect(getBlogsListResponse.items).toBeInstanceOf(Array);
    expect(getBlogsListResponse.items.length).toBe(0);
    expect(getBlogsListResponse.totalCount).toBe(0);
  });

  it('❌ 003 should not return a blog by incorrect ID; GET /api/blogs/:id', async () => {
    const incorrectBlogId_01: string = 'ABC';
    const incorrectBlogId_02: number = 2;
    const incorrectBlogId_03: null = null;
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await getBlogById(app, incorrectBlogId_01, testStatus);
    await getBlogById(app, incorrectBlogId_02, testStatus);
    await getBlogById(app, incorrectBlogId_03, testStatus);
    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlogId);

    expect(getBlogByIdResponse).toEqual(createdBlog);
  });

  it('❌ 004 should not return a list of blogs when incorrect pagination settings passed; GET /api/blogs', async () => {
    const correctPageSize: number = 5;
    const correctPageNumber: number = 1;
    const correctSortDirection: string = 'asc';
    const correctSortBy: string = 'name';
    const correctUrl: string = `${SETTINGS.BLOGS_PATH}?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectPageSize: number = 101;
    const incorrectPageNumber: number = -1;
    const incorrectSortDirection: string = 'cas';
    const incorrectSortBy: string = 'shortDescription';
    const incorrectUrl_01: string = `${SETTINGS.BLOGS_PATH}?pageSize=${incorrectPageSize}&pageNumber=${correctPageNumber}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_02: string = `${SETTINGS.BLOGS_PATH}?pageSize=${correctPageSize}&pageNumber=${incorrectPageNumber}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_03: string = `${SETTINGS.BLOGS_PATH}?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&sortDirection=${incorrectSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_04: string = `${SETTINGS.BLOGS_PATH}?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&sortDirection=${correctSortDirection}&sortBy=${incorrectSortBy}`;
    await Promise.all([createBlog(app), createBlog(app)]);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await getBlogsList(app, incorrectUrl_01, testStatus);
    await getBlogsList(app, incorrectUrl_02, testStatus);
    await getBlogsList(app, incorrectUrl_03, testStatus);
    await getBlogsList(app, incorrectUrl_04, testStatus);
    const getBlogsListResponse: PaginatedBlogsListOutputDTO = await getBlogsList(app, correctUrl);

    expect(getBlogsListResponse.items).toBeInstanceOf(Array);
    expect(getBlogsListResponse.items.length).toBe(2);
    expect(getBlogsListResponse.totalCount).toBe(2);
  });

  it('❌ 005 should not update a blog by ID without proper basic authorization; PUT /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;

    await updateBlogById(app, createdBlogId, undefined, HttpStatuses.Unauthorized_401, 'token');
    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlogId);

    expect(getBlogByIdResponse).toEqual(createdBlog);
  });

  it('❌ 006 should not update a blog by incorrect ID; PUT /api/blogs/:id', async () => {
    const incorrectBlogId_01: string = 'ABC';
    const incorrectBlogId_02: number = 2;
    const incorrectBlogId_03: null = null;
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await updateBlogById(app, incorrectBlogId_01, undefined, testStatus);
    await updateBlogById(app, incorrectBlogId_02, undefined, testStatus);
    await updateBlogById(app, incorrectBlogId_03, undefined, testStatus);
    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlogId);

    expect(getBlogByIdResponse).toEqual(createdBlog);
  });

  it('❌ 007 should not update a blog by ID when incorrect body passed; PUT /api/blogs/:id', async () => {
    const correctUpdateBlogData: UpdateBlogInputDTO = getUpdateBlogInputDTO();
    const incorrectName_01: string = '';
    const incorrectName_02: string = '   ';
    const incorrectName_03: string = '0123456789111111';
    const incorrectName_04: null = null;
    const incorrectDescription_01: string = '';
    const incorrectDescription_02: string = '   ';
    const incorrectDescription_03: null = null;
    const incorrectWebsiteUrl_01: string = '';
    const incorrectWebsiteUrl_02: string = '   ';
    const incorrectWebsiteUrl_03: string = 'www.websiteurl01.com/blog-01';
    const incorrectWebsiteUrl_04: null = null;
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await updateBlogById(app, createdBlogId, { ...correctUpdateBlogData, name: incorrectName_01 }, testStatus);
    await updateBlogById(app, createdBlogId, { ...correctUpdateBlogData, name: incorrectName_02 }, testStatus);
    await updateBlogById(app, createdBlogId, { ...correctUpdateBlogData, name: incorrectName_03 }, testStatus);
    await updateBlogById(app, createdBlogId, { ...correctUpdateBlogData, name: incorrectName_04 }, testStatus);

    await updateBlogById(
      app,
      createdBlogId,
      { ...correctUpdateBlogData, description: incorrectDescription_01 },
      testStatus
    );

    await updateBlogById(
      app,
      createdBlogId,
      { ...correctUpdateBlogData, description: incorrectDescription_02 },
      testStatus
    );

    await updateBlogById(
      app,
      createdBlogId,
      { ...correctUpdateBlogData, description: incorrectDescription_03 },
      testStatus
    );

    await updateBlogById(
      app,
      createdBlogId,
      { ...correctUpdateBlogData, websiteUrl: incorrectWebsiteUrl_01 },
      testStatus
    );

    await updateBlogById(
      app,
      createdBlogId,
      { ...correctUpdateBlogData, websiteUrl: incorrectWebsiteUrl_02 },
      testStatus
    );

    await updateBlogById(
      app,
      createdBlogId,
      { ...correctUpdateBlogData, websiteUrl: incorrectWebsiteUrl_03 },
      testStatus
    );

    await updateBlogById(
      app,
      createdBlogId,
      { ...correctUpdateBlogData, websiteUrl: incorrectWebsiteUrl_04 },
      testStatus
    );

    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlogId);

    expect(getBlogByIdResponse).toEqual(createdBlog);
  });

  it('❌ 008 should not delete a blog by ID without proper basic authorization; DELETE /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;

    await deleteBlogById(app, createdBlogId, HttpStatuses.Unauthorized_401, 'token');
    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlogId);

    expect(getBlogByIdResponse).toEqual(createdBlog);
  });

  it('❌ 009 should not delete a blog by incorrect ID; DELETE /api/blogs/:id', async () => {
    const incorrectBlogId_01: string = 'ABC';
    const incorrectBlogId_02: number = 2;
    const incorrectBlogId_03: null = null;
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await deleteBlogById(app, incorrectBlogId_01, testStatus);
    await deleteBlogById(app, incorrectBlogId_02, testStatus);
    await deleteBlogById(app, incorrectBlogId_03, testStatus);
    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlogId);

    expect(getBlogByIdResponse).toEqual(createdBlog);
  });

  it('❌ 010 should not create a post for a blog by ID without proper basic authorization; POST /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;

    await createPostInBlog(app, createdBlogId, undefined, HttpStatuses.Unauthorized_401, 'token');
    const getPostsListByBlogIdResponse: PaginatedPostsListOutputDTO = await getPostsListByBlogId(app, createdBlogId);

    expect(getPostsListByBlogIdResponse.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.items.length).toBe(0);
    expect(getPostsListByBlogIdResponse.totalCount).toBe(0);
  });

  it('❌ 011 should not create a post for a blog by incorrect ID; POST /api/blogs/:blogId/posts', async () => {
    const incorrectBlogId_01: string = '   ';
    const incorrectBlogId_02: string = 'ABC';
    const incorrectBlogId_03: number = 2;
    const incorrectBlogId_04: null = null;
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await createPostInBlog(app, incorrectBlogId_01, undefined, testStatus);
    await createPostInBlog(app, incorrectBlogId_02, undefined, testStatus);
    await createPostInBlog(app, incorrectBlogId_03, undefined, testStatus);
    await createPostInBlog(app, incorrectBlogId_04, undefined, testStatus);
    const getPostsListByBlogIdResponse: PaginatedPostsListOutputDTO = await getPostsListByBlogId(app, createdBlogId);

    expect(getPostsListByBlogIdResponse.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.items.length).toBe(0);
    expect(getPostsListByBlogIdResponse.totalCount).toBe(0);
  });

  it('❌ 012 should not create a post for a blog by ID when incorrect body passed; POST /api/blogs/:blogId/posts', async () => {
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
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const correctCreatePostInBlogData: CreatePostInBlogInputDTO = getCreatePostInBlogInputDTO();
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await createPostInBlog(
      app,
      createdBlogId,
      { ...correctCreatePostInBlogData, title: incorrectTitle_01 },
      testStatus
    );

    await createPostInBlog(
      app,
      createdBlogId,
      { ...correctCreatePostInBlogData, title: incorrectTitle_02 },
      testStatus
    );

    await createPostInBlog(
      app,
      createdBlogId,
      { ...correctCreatePostInBlogData, title: incorrectTitle_03 },
      testStatus
    );

    await createPostInBlog(
      app,
      createdBlogId,
      { ...correctCreatePostInBlogData, title: incorrectTitle_04 },
      testStatus
    );

    await createPostInBlog(
      app,
      createdBlogId,
      { ...correctCreatePostInBlogData, title: incorrectTitle_05 },
      testStatus
    );

    await createPostInBlog(
      app,
      createdBlogId,
      { ...correctCreatePostInBlogData, shortDescription: incorrectShortDescription_01 },
      testStatus
    );

    await createPostInBlog(
      app,
      createdBlogId,
      { ...correctCreatePostInBlogData, shortDescription: incorrectShortDescription_02 },
      testStatus
    );

    await createPostInBlog(
      app,
      createdBlogId,
      { ...correctCreatePostInBlogData, shortDescription: incorrectShortDescription_03 },
      testStatus
    );

    await createPostInBlog(
      app,
      createdBlogId,
      { ...correctCreatePostInBlogData, content: incorrectContent_01 },
      testStatus
    );

    await createPostInBlog(
      app,
      createdBlogId,
      { ...correctCreatePostInBlogData, content: incorrectContent_02 },
      testStatus
    );

    await createPostInBlog(
      app,
      createdBlogId,
      { ...correctCreatePostInBlogData, content: incorrectContent_03 },
      testStatus
    );

    const getPostsListByBlogIdResponse: PaginatedPostsListOutputDTO = await getPostsListByBlogId(app, createdBlogId);

    expect(getPostsListByBlogIdResponse.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.items.length).toBe(0);
    expect(getPostsListByBlogIdResponse.totalCount).toBe(0);
  });

  it('❌ 013 should not return a list of posts for a blog by incorrect ID; GET /api/blogs/:blogId/posts', async () => {
    const incorrectBlogId_01: string = '   ';
    const incorrectBlogId_02: string = 'ABC';
    const incorrectBlogId_03: number = 2;
    const incorrectBlogId_04: null = null;
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    await Promise.all([createPostInBlog(app, createdBlogId), createPostInBlog(app, createdBlogId)]);
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await getPostsListByBlogId(app, incorrectBlogId_01, undefined, testStatus);
    await getPostsListByBlogId(app, incorrectBlogId_02, undefined, testStatus);
    await getPostsListByBlogId(app, incorrectBlogId_03, undefined, testStatus);
    await getPostsListByBlogId(app, incorrectBlogId_04, undefined, testStatus);
    const getPostsListByBlogIdResponse: PaginatedPostsListOutputDTO = await getPostsListByBlogId(app, createdBlogId);

    expect(getPostsListByBlogIdResponse.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.items.length).toBe(2);
    expect(getPostsListByBlogIdResponse.totalCount).toBe(2);
  });

  it('❌ 014 should not return a list of posts for a blog by ID when incorrect pagination settings passed; GET /api/blogs/:blogId/posts', async () => {
    const correctPageSize: number = 5;
    const correctPageNumber: number = 1;
    const correctSortDirection: string = 'asc';
    const correctSortBy: string = 'title';
    const incorrectPageSize: number = 101;
    const incorrectPageNumber: number = -1;
    const incorrectSortDirection: string = 'cas';
    const incorrectSortBy: string = 'description';
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const correctUrl = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_01 = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${incorrectPageSize}&pageNumber=${correctPageNumber}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_02 = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${correctPageSize}&pageNumber=${incorrectPageNumber}&sortDirection=${correctSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_03 = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&sortDirection=${incorrectSortDirection}&sortBy=${correctSortBy}`;
    const incorrectUrl_04 = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${correctPageSize}&pageNumber=${correctPageNumber}&sortDirection=${correctSortDirection}&sortBy=${incorrectSortBy}`;
    const testStatus: HttpStatuses = HttpStatuses.BadRequest_400;

    await Promise.all([
      createPostInBlog(app, createdBlogId),
      createPostInBlog(app, createdBlogId),
      createPostInBlog(app, createdBlogId),
      createPostInBlog(app, createdBlogId),
      createPostInBlog(app, createdBlogId),
      createPostInBlog(app, createdBlogId),
    ]);

    await getPostsListByBlogId(app, createdBlogId, incorrectUrl_01, testStatus);
    await getPostsListByBlogId(app, createdBlogId, incorrectUrl_02, testStatus);
    await getPostsListByBlogId(app, createdBlogId, incorrectUrl_03, testStatus);
    await getPostsListByBlogId(app, createdBlogId, incorrectUrl_04, testStatus);

    const getPostsListByBlogIdResponse: PaginatedPostsListOutputDTO = await getPostsListByBlogId(
      app,
      createdBlogId,
      correctUrl
    );

    expect(getPostsListByBlogIdResponse.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.items.length).toBe(5);
    expect(getPostsListByBlogIdResponse.totalCount).toBe(6);
  });
});
