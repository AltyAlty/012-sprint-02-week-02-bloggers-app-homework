import 'dotenv/config';
import express from 'express';
import request from 'supertest';
import { setupApp } from '../../../src/setup-app';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../../utils/auth/generate-admin-auth-token';
import { clearDb } from '../../utils/db/clear-db';
import { runDB, stopDb } from '../../../src/db/mongodb/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import { createBlog } from '../../utils/blogs/create-blog';
import { getBlogById } from '../../utils/blogs/get-blog-by-id';
import { UpdateBlogInputDTO } from '../../../src/blogs/routes/input-dto/update-blog.input-dto';
import { updateBlogById } from '../../utils/blogs/update-blog-by-id';
import { getCreateBlogInputDTO } from '../../utils/blogs/get-create-blog-input-dto';
import { createPost } from '../../utils/posts/create-post';
import { getCreatePostInputDTO } from '../../utils/posts/get-create-post-input-dto';
import { BlogOutputDTO } from '../../../src/blogs/routes/output-dto/blog.output-dto';
import { CreatePostInputDTO } from '../../../src/posts/routes/input-dto/create-post.input-dto';
import { getUpdateBlogInputDTO } from '../../utils/blogs/get-update-blog-input-dto';

/*Тестовый набор.*/
describe('Blogs API endpoints check', () => {
  /*Создаем экземпляр приложения Express.*/
  const app = express();
  /*Настраиваем экземпляр приложения Express при помощи функции "setupApp()".*/
  setupApp(app);
  /*Генерируем токен для Basic авторизации.*/
  const adminToken = generateBasicAuthToken();

  /*Перед запуском всех тестов запускаем и очищаем БД.*/
  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL, SETTINGS.TEST_DB_NAME);
    await clearDb(app);
  });

  /*Перед запуском каждого теста очищаем БД.*/
  beforeEach(async () => await clearDb(app));

  /*После того как тесты отработают, очищаем и отключаемся от БД.*/
  afterAll(async () => {
    await clearDb(app);
    await stopDb();
  });

  /*Описываем тесты.*/
  it('✅ 001 should create a blog; POST /api/blogs', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const getBlogsListResponse = await request(app).get(SETTINGS.BLOGS_PATH).expect(HttpStatuses.Ok_200);
    expect(getBlogsListResponse.body.items).toBeInstanceOf(Array);
    expect(getBlogsListResponse.body.items.length).toBe(1);
    expect(getBlogsListResponse.body.totalCount).toBe(1);
    expect(getBlogsListResponse.body.items[0]).toEqual({ ...createdBlog });
  });

  it('✅ 002 should return a list of blogs; GET /api/blogs', async () => {
    await Promise.all([createBlog(app), createBlog(app)]);
    const getBlogsListResponse = await request(app).get(SETTINGS.BLOGS_PATH).expect(HttpStatuses.Ok_200);
    expect(getBlogsListResponse.body.items).toBeInstanceOf(Array);
    expect(getBlogsListResponse.body.items.length).toBe(2);
    expect(getBlogsListResponse.body.totalCount).toBe(2);
  });

  it('✅ 003 should return a list of blogs when correct pagination settings passed; GET /api/blogs', async () => {
    await Promise.all([
      createBlog(app, { ...getCreateBlogInputDTO(), name: 'Tim1' }),
      createBlog(app, { ...getCreateBlogInputDTO(), name: 'Tim2' }),
      createBlog(app, { ...getCreateBlogInputDTO(), name: 'Tim3' }),
      createBlog(app, { ...getCreateBlogInputDTO(), name: 'Tim4' }),
      createBlog(app, { ...getCreateBlogInputDTO(), name: 'Tim5' }),
      createBlog(app, { ...getCreateBlogInputDTO(), name: 'Tim6' }),
      createBlog(app),
      createBlog(app),
    ]);

    const pageSize = 5;
    const pageNumber = 1;
    const searchNameTerm = 'Tim';
    const sortDirection = 'asc';
    const sortBy = 'name';

    const getBlogsListResponse = await request(app)
      /*Example: /api/blogs?pageSize=5&pageNumber=1&searchNameTerm=Tim&sortDirection=asc&sortBy=name*/
      .get(
        `${SETTINGS.BLOGS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&searchNameTerm=${searchNameTerm}&sortDirection=${sortDirection}&sortBy=${sortBy}`
      )
      .expect(HttpStatuses.Ok_200);

    expect(getBlogsListResponse.body.items).toBeInstanceOf(Array);
    expect(getBlogsListResponse.body.items.length).toBe(5);
    expect(getBlogsListResponse.body.totalCount).toBe(6);
    expect(getBlogsListResponse.body.items[0].name).toBe('Tim1');
    expect(getBlogsListResponse.body.items[1].name).toBe('Tim2');
    expect(getBlogsListResponse.body.items[2].name).toBe('Tim3');
    expect(getBlogsListResponse.body.items[3].name).toBe('Tim4');
    expect(getBlogsListResponse.body.items[4].name).toBe('Tim5');
  });

  it('✅ 004 should return a list of posts for an existing blog specified by ID; GET /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;

    await Promise.all([
      createPost(app, undefined, createdBlogId),
      createPost(app, undefined, createdBlogId),
      createPost(app, undefined, createdBlogId),
      createPost(app, undefined, createdBlogId),
      createPost(app, undefined, createdBlogId),
      createPost(app, undefined, createdBlogId),
    ]);

    const getPostsListByBlogIdResponse = await request(app)
      .get(`${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=5`)
      .expect(HttpStatuses.Ok_200);

    expect(getPostsListByBlogIdResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.body.items.length).toBe(5);
    expect(getPostsListByBlogIdResponse.body.totalCount).toBe(6);
  });

  it('✅ 005 should create a post for an existing blog specified by ID; POST /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const createPostData: CreatePostInputDTO = getCreatePostInputDTO(createdBlogId);

    await request(app)
      .post(`${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts`)
      .set('Authorization', adminToken)
      .send(createPostData)
      .expect(HttpStatuses.Created_201);

    const getPostsListByBlogIdResponse = await request(app)
      .get(`${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts`)
      .expect(HttpStatuses.Ok_200);

    expect(getPostsListByBlogIdResponse.body.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.body.items.length).toBe(1);
    expect(getPostsListByBlogIdResponse.body.totalCount).toBe(1);
    expect(getPostsListByBlogIdResponse.body.items[0].title).toBe(createPostData.title);
    expect(getPostsListByBlogIdResponse.body.items[0].shortDescription).toBe(createPostData.shortDescription);
    expect(getPostsListByBlogIdResponse.body.items[0].content).toBe(createPostData.content);
    expect(getPostsListByBlogIdResponse.body.items[0].blogId).toBe(createdBlogId);
  });

  it('✅ 006 should return a blog by ID; GET /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlogId);
    expect(getBlogByIdResponse).toEqual({ ...createdBlog });
  });

  it('✅ 007 should update a blog by ID; PUT /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const updateBlogData: UpdateBlogInputDTO = getUpdateBlogInputDTO();
    await updateBlogById(app, createdBlogId, updateBlogData);
    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlogId);

    expect(getBlogByIdResponse).toEqual({
      id: createdBlogId,
      name: updateBlogData.name,
      description: updateBlogData.description,
      websiteUrl: updateBlogData.websiteUrl,
      createdAt: expect.any(String),
      isMembership: expect.any(Boolean),
    });
  });

  it('✅ 008 should delete a blog by ID; DELETE /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;

    await request(app)
      .delete(`${SETTINGS.BLOGS_PATH}/${createdBlogId}`)
      .set('Authorization', adminToken)
      .expect(HttpStatuses.NoContent_204);

    await request(app).get(`${SETTINGS.BLOGS_PATH}/${createdBlogId}`).expect(HttpStatuses.NotFound_404);
  });
});
