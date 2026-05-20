import 'dotenv/config';
import express from 'express';
import request from 'supertest';
import { setupApp } from '../../../src/setup-app';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../../utils/auth/generate-admin-auth-token';
import { clearDb } from '../../utils/db/clear-db';
import { runDB, stopDb } from '../../../src/db/mongodb/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import { createBlog } from '../../utils/blogs/create-blog';
import { getCreateBlogInputDTO } from '../../utils/blogs/get-create-blog-input-dto';
import { CreateBlogInputDTO } from '../../../src/blogs/routes/input-dto/create-blog.input-dto';
import { createPost } from '../../utils/posts/create-post';
import { getCreatePostInputDTO } from '../../utils/posts/get-create-post-input-dto';
import { getBlogById } from '../../utils/blogs/get-blog-by-id';
import { UpdateBlogInputDTO } from '../../../src/blogs/routes/input-dto/update-blog.input-dto';
import { BlogOutputDTO } from '../../../src/blogs/routes/output-dto/blog.output-dto';
import { CreatePostInputDTO } from '../../../src/posts/routes/input-dto/create-post.input-dto';
import { getUpdateBlogInputDTO } from '../../utils/blogs/get-update-blog-input-dto';

describe('Blogs API ID, body and auth validation checks', () => {
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

  it('❌ 001 should not return a list of blogs when incorrect pagination settings passed; GET /api/blogs', async () => {
    await Promise.all([createBlog(app), createBlog(app)]);
    const pageSize = 5;
    const pageNumber = 1;
    const sortDirection = 'asc';
    const sortBy = 'name';
    const correctQuery = `${SETTINGS.BLOGS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;

    const incorrectPageSize = 101;
    const incorrectPageNumber = -1;
    const incorrectSortDirection = 'cas';
    const incorrectSortBy = 'shortDescription';
    const incorrectQuery1 = `${SETTINGS.BLOGS_PATH}?pageSize=${incorrectPageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;
    const incorrectQuery2 = `${SETTINGS.BLOGS_PATH}?pageSize=${pageSize}&pageNumber=${incorrectPageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;
    const incorrectQuery3 = `${SETTINGS.BLOGS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${incorrectSortDirection}&sortBy=${sortBy}`;
    const incorrectQuery4 = `${SETTINGS.BLOGS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${incorrectSortBy}`;

    await request(app).get(incorrectQuery1).expect(HttpStatus.BadRequest_400);
    await request(app).get(incorrectQuery2).expect(HttpStatus.BadRequest_400);
    await request(app).get(incorrectQuery3).expect(HttpStatus.BadRequest_400);
    await request(app).get(incorrectQuery4).expect(HttpStatus.BadRequest_400);

    const getBlogsListResponse = await request(app).get(correctQuery).expect(HttpStatus.Ok_200);
    expect(getBlogsListResponse.body.items).toBeInstanceOf(Array);
    expect(getBlogsListResponse.body.items.length).toBe(2);
    expect(getBlogsListResponse.body.totalCount).toBe(2);
  });

  it('❌ 002 should not create a blog without proper basic authorization; POST /api/blogs', async () => {
    const correctCreateBlogData: CreateBlogInputDTO = getCreateBlogInputDTO();
    await request(app).post(SETTINGS.BLOGS_PATH).send(correctCreateBlogData).expect(HttpStatus.Unauthorized_401);
    const getBlogsListResponse = await request(app).get(SETTINGS.BLOGS_PATH).expect(HttpStatus.Ok_200);
    expect(getBlogsListResponse.body.items).toBeInstanceOf(Array);
    expect(getBlogsListResponse.body.items.length).toBe(0);
    expect(getBlogsListResponse.body.totalCount).toBe(0);
  });

  it('❌ 003 should not create a blog when incorrect body passed; POST /api/blogs', async () => {
    const correctCreateBlogData: CreateBlogInputDTO = getCreateBlogInputDTO();

    const checkBlogCreating = async (
      name = correctCreateBlogData.name,
      description: string | null = correctCreateBlogData.description,
      websiteUrl = correctCreateBlogData.websiteUrl
    ) => {
      await request(app)
        .post(SETTINGS.BLOGS_PATH)
        .set('Authorization', adminToken)
        .send({ name, description, websiteUrl })
        .expect(HttpStatus.BadRequest_400);
    };

    await checkBlogCreating('');
    await checkBlogCreating('0123456789111111');
    await checkBlogCreating('   ');
    await checkBlogCreating(undefined, '');
    await checkBlogCreating(undefined, null);
    await checkBlogCreating(undefined, '   ');
    await checkBlogCreating(undefined, undefined, '');
    await checkBlogCreating(undefined, undefined, 'www.websiteurl01.com/blog-01');
    await checkBlogCreating(undefined, undefined, '   ');

    const getBlogsListResponse = await request(app).get(SETTINGS.BLOGS_PATH).expect(HttpStatus.Ok_200);
    expect(getBlogsListResponse.body.items).toBeInstanceOf(Array);
    expect(getBlogsListResponse.body.items.length).toBe(0);
    expect(getBlogsListResponse.body.totalCount).toBe(0);
  });

  it('❌ 004 should not return a list of posts for an existing blog specified by incorrect ID; GET /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    await Promise.all([createPost(app, undefined, createdBlogId), createPost(app, undefined, createdBlogId)]);

    const incorrectBlogId1 = '   ';
    const incorrectBlogId2 = null;
    const incorrectBlogId3 = 'ABC';
    const incorrectBlogId4 = 2;
    const incorrectURL1 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId1}/posts`;
    const incorrectURL2 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId2}/posts`;
    const incorrectURL3 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId3}/posts`;
    const incorrectURL4 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId4}/posts`;
    const correctURL = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts`;

    await request(app).get(incorrectURL1).expect(HttpStatus.BadRequest_400);
    await request(app).get(incorrectURL2).expect(HttpStatus.BadRequest_400);
    await request(app).get(incorrectURL3).expect(HttpStatus.BadRequest_400);
    await request(app).get(incorrectURL4).expect(HttpStatus.BadRequest_400);

    const getPostsListByBlogIdResponse = await request(app).get(correctURL).expect(HttpStatus.Ok_200);
    expect(getPostsListByBlogIdResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.body.items.length).toBe(2);
    expect(getPostsListByBlogIdResponse.body.totalCount).toBe(2);
  });

  it('❌ 005 should not return a list of posts for an existing blog specified by ID when incorrect pagination settings passed; GET /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const pageSize = 5;
    const pageNumber = 1;
    const sortDirection = 'asc';
    const sortBy = 'title';
    const correctQuery = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;

    const incorrectPageSize = 101;
    const incorrectPageNumber = -1;
    const incorrectSortDirection = 'cas';
    const incorrectSortBy = 'description';
    const incorrectQuery1 = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${incorrectPageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;
    const incorrectQuery2 = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${pageSize}&pageNumber=${incorrectPageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;
    const incorrectQuery3 = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${incorrectSortDirection}&sortBy=${sortBy}`;
    const incorrectQuery4 = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${incorrectSortBy}`;

    await Promise.all([
      createPost(app, undefined, createdBlogId),
      createPost(app, undefined, createdBlogId),
      createPost(app, undefined, createdBlogId),
      createPost(app, undefined, createdBlogId),
      createPost(app, undefined, createdBlogId),
      createPost(app, undefined, createdBlogId),
    ]);

    await request(app).get(incorrectQuery1).expect(HttpStatus.BadRequest_400);
    await request(app).get(incorrectQuery2).expect(HttpStatus.BadRequest_400);
    await request(app).get(incorrectQuery3).expect(HttpStatus.BadRequest_400);
    await request(app).get(incorrectQuery4).expect(HttpStatus.BadRequest_400);

    const getPostsListByBlogIdResponse = await request(app).get(correctQuery).expect(HttpStatus.Ok_200);
    expect(getPostsListByBlogIdResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.body.items.length).toBe(5);
    expect(getPostsListByBlogIdResponse.body.totalCount).toBe(6);
  });

  it('❌ 006 should not create a post for an existing blog specified by ID without proper basic authorization; POST /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const createPostData: CreatePostInputDTO = getCreatePostInputDTO(createdBlogId);

    await request(app)
      .post(`${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts`)
      .send(createPostData)
      .expect(HttpStatus.Unauthorized_401);

    const getPostsListByBlogIdResponse = await request(app)
      .get(`${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=5`)
      .expect(HttpStatus.Ok_200);

    expect(getPostsListByBlogIdResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.body.items.length).toBe(0);
    expect(getPostsListByBlogIdResponse.body.totalCount).toBe(0);
  });

  it('❌ 007 should not create a post for an existing blog specified by incorrect ID; POST /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const createPostData: CreatePostInputDTO = getCreatePostInputDTO(createdBlogId);

    const incorrectBlogId1 = '   ';
    const incorrectBlogId2 = null;
    const incorrectBlogId3 = 'ABC';
    const incorrectBlogId4 = 2;
    const incorrectURL1 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId1}/posts`;
    const incorrectURL2 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId2}/posts`;
    const incorrectURL3 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId3}/posts`;
    const incorrectURL4 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId4}/posts`;

    const checkPostCreating = async (url: string) => {
      await request(app)
        .post(url)
        .set('Authorization', adminToken)
        .send(createPostData)
        .expect(HttpStatus.BadRequest_400);
    };

    await checkPostCreating(incorrectURL1);
    await checkPostCreating(incorrectURL2);
    await checkPostCreating(incorrectURL3);
    await checkPostCreating(incorrectURL4);

    const getPostsListByBlogIdResponse = await request(app)
      .get(`${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts`)
      .expect(HttpStatus.Ok_200);

    expect(getPostsListByBlogIdResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.body.items.length).toBe(0);
    expect(getPostsListByBlogIdResponse.body.totalCount).toBe(0);
  });

  it('❌ 008 should not create a post for an existing blog specified by ID when incorrect body passed; POST /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const correctCreatePostData: CreatePostInputDTO = getCreatePostInputDTO(createdBlogId);
    const correctURL = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts`;

    const checkPostCreating = async (
      title = correctCreatePostData.title,
      shortDescription: string | null = correctCreatePostData.shortDescription,
      content: string | null = correctCreatePostData.content
    ) => {
      await request(app)
        .post(correctURL)
        .set('Authorization', adminToken)
        .send({ title, shortDescription, content, blogId: createdBlogId })
        .expect(HttpStatus.BadRequest_400);
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

    const getPostsListByBlogIdResponse = await request(app).get(correctURL).expect(HttpStatus.Ok_200);
    expect(getPostsListByBlogIdResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.body.items.length).toBe(0);
    expect(getPostsListByBlogIdResponse.body.totalCount).toBe(0);
  });

  it('❌ 009 should not return a blog specified by incorrect ID; GET /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;

    const incorrectBlogId1 = null;
    const incorrectBlogId2 = 'ABC';
    const incorrectBlogId3 = 2;
    const incorrectURL1 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId1}`;
    const incorrectURL2 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId2}`;
    const incorrectURL3 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId3}`;

    await request(app).get(incorrectURL1).expect(HttpStatus.BadRequest_400);
    await request(app).get(incorrectURL2).expect(HttpStatus.BadRequest_400);
    await request(app).get(incorrectURL3).expect(HttpStatus.BadRequest_400);

    const getBlogByIdResponse = await getBlogById(app, createdBlogId);
    expect(getBlogByIdResponse).toEqual({ ...createdBlog });
  });

  it('❌ 010 should not update a blog specified by ID without proper basic authorization; PUT /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const updateBlogData: UpdateBlogInputDTO = getUpdateBlogInputDTO();

    await request(app)
      .put(`${SETTINGS.BLOGS_PATH}/${createdBlogId}`)
      .send(updateBlogData)
      .expect(HttpStatus.Unauthorized_401);

    const getBlogByIdResponse = await getBlogById(app, createdBlogId);

    expect(getBlogByIdResponse).toEqual({
      id: createdBlogId,
      name: createdBlog.name,
      description: createdBlog.description,
      websiteUrl: createdBlog.websiteUrl,
      createdAt: expect.any(String),
      isMembership: expect.any(Boolean),
    });
  });

  it('❌ 011 should not update a blog specified by incorrect ID; PUT /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const updateBlogData: UpdateBlogInputDTO = getUpdateBlogInputDTO();

    const incorrectBlogId1 = null;
    const incorrectBlogId2 = 'ABC';
    const incorrectBlogId3 = 2;
    const incorrectURL1 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId1}`;
    const incorrectURL2 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId2}`;
    const incorrectURL3 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId3}`;

    const checkBlogUpdating = async (url: string) => {
      await request(app)
        .put(url)
        .set('Authorization', adminToken)
        .send(updateBlogData)
        .expect(HttpStatus.BadRequest_400);
    };

    await checkBlogUpdating(incorrectURL1);
    await checkBlogUpdating(incorrectURL2);
    await checkBlogUpdating(incorrectURL3);

    const getBlogByIdResponse = await getBlogById(app, createdBlogId);

    expect(getBlogByIdResponse).toEqual({
      id: createdBlogId,
      name: createdBlog.name,
      description: createdBlog.description,
      websiteUrl: createdBlog.websiteUrl,
      createdAt: expect.any(String),
      isMembership: expect.any(Boolean),
    });
  });

  it('❌ 012 should not update a blog specified by ID when incorrect body passed; PUT /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const correctUpdateBlogData: UpdateBlogInputDTO = getUpdateBlogInputDTO();

    const checkBlogUpdating = async (
      name = correctUpdateBlogData.name,
      description: string | null = correctUpdateBlogData.description,
      websiteUrl = correctUpdateBlogData.websiteUrl
    ) => {
      await request(app)
        .put(`${SETTINGS.BLOGS_PATH}/${createdBlogId}`)
        .set('Authorization', adminToken)
        .send({ name, description, websiteUrl })
        .expect(HttpStatus.BadRequest_400);
    };

    await checkBlogUpdating('');
    await checkBlogUpdating('0123456789111111');
    await checkBlogUpdating('   ');
    await checkBlogUpdating(undefined, '');
    await checkBlogUpdating(undefined, null);
    await checkBlogUpdating(undefined, '   ');
    await checkBlogUpdating(undefined, undefined, '');
    await checkBlogUpdating(undefined, undefined, 'www.updwebsiteurl01.com/blog-01');
    await checkBlogUpdating(undefined, undefined, '   ');

    const getBlogByIdResponse = await getBlogById(app, createdBlogId);

    expect(getBlogByIdResponse).toEqual({
      id: createdBlogId,
      name: createdBlog.name,
      description: createdBlog.description,
      websiteUrl: createdBlog.websiteUrl,
      createdAt: expect.any(String),
      isMembership: expect.any(Boolean),
    });
  });

  it('❌ 013 should not delete a blog specified by ID without proper basic authorization; DELETE /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    await request(app).delete(`${SETTINGS.BLOGS_PATH}/${createdBlogId}`).expect(HttpStatus.Unauthorized_401);
    const getBlogByIdResponse = await getBlogById(app, createdBlogId);
    expect(getBlogByIdResponse).toEqual({ ...createdBlog });
  });

  it('❌ 014 should not delete a blog specified by incorrect ID; DELETE /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;

    const incorrectBlogId1 = null;
    const incorrectBlogId2 = 'ABC';
    const incorrectBlogId3 = 2;
    const incorrectURL1 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId1}`;
    const incorrectURL2 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId2}`;
    const incorrectURL3 = `${SETTINGS.BLOGS_PATH}/${incorrectBlogId3}`;

    await request(app).delete(incorrectURL1).set('Authorization', adminToken).expect(HttpStatus.BadRequest_400);
    await request(app).delete(incorrectURL2).set('Authorization', adminToken).expect(HttpStatus.BadRequest_400);
    await request(app).delete(incorrectURL3).set('Authorization', adminToken).expect(HttpStatus.BadRequest_400);

    const getBlogByIdResponse = await getBlogById(app, createdBlogId);
    expect(getBlogByIdResponse).toEqual({ ...createdBlog });
  });
});
