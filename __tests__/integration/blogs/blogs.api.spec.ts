import 'dotenv/config';
import { HttpStatuses } from '../../../src/core/types/http-statuses';
import { SETTINGS } from '../../../src/core/settings/settings';
import { createBlog } from '../../utils/blogs/create-blog';
import { getBlogById } from '../../utils/blogs/get-blog-by-id';
import { UpdateBlogInputDTO } from '../../../src/blogs/routes/input-dto/update-blog.input-dto';
import { updateBlogById } from '../../utils/blogs/update-blog-by-id';
import { BlogOutputDTO } from '../../../src/blogs/routes/output-dto/blog.output-dto';
import { getUpdateBlogInputDTO } from '../../utils/blogs/get-update-blog-input-dto';
import { PostOutputDTO } from '../../../src/posts/routes/output-dto/post.output-dto';
import { getPostById } from '../../utils/posts/get-post-by-id';
import { getBlogsList } from '../../utils/blogs/get-blogs-list';
import { getPostsListByBlogId } from '../../utils/blogs/get-posts-list-by-blog-id';
import { deleteBlogById } from '../../utils/blogs/delete-blog-by-id';
import { createPostInBlog } from '../../utils/blogs/create-post-in-blog';
import { doBeforeTests } from '../../utils/common/do-before-tests';

/*Тестовый набор.*/
describe('Blogs API', () => {
  /*Делаем предварительные действия и получаем настроенный экземпляр приложения Express.*/
  const app = doBeforeTests();

  /*Тесты.*/
  it('✅ 001 should create a blog; POST /api/blogs', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const getBlogByIdResponse = await getBlogById(app, createdBlogId);

    expect(getBlogByIdResponse).toEqual(createdBlog);
  });

  it('✅ 002 should return a blog by ID; GET /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;

    const getBlogByIdResponse: BlogOutputDTO = await getBlogById(app, createdBlogId);

    expect(getBlogByIdResponse).toEqual(createdBlog);
    expect(getBlogByIdResponse.id).toBe(createdBlogId);
  });

  it('✅ 003 should return a list of blogs; GET /api/blogs', async () => {
    await Promise.all([createBlog(app), createBlog(app)]);

    const getBlogsListResponse = await getBlogsList(app);

    expect(getBlogsListResponse.items).toBeInstanceOf(Array);
    expect(getBlogsListResponse.items.length).toBe(2);
    expect(getBlogsListResponse.totalCount).toBe(2);
  });

  it('✅ 004 should return a list of blogs when correct pagination settings passed; GET /api/blogs', async () => {
    const pageSize: number = 5;
    const pageNumber: number = 1;
    const searchNameTerm: string = 'blog';
    const sortDirection: string = 'asc';
    const sortBy: string = 'name';
    const url: string = `${SETTINGS.BLOGS_PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}&searchNameTerm=${searchNameTerm}&sortDirection=${sortDirection}&sortBy=${sortBy}`;
    const blogName_01 = 'blog name 01';
    const blogName_02 = 'blog name 02';
    const blogName_03 = 'blog name 03';
    const blogName_04 = 'blog name 04';
    const blogName_05 = 'blog name 05';
    const blogName_06 = 'blog name 06';

    await Promise.all([
      createBlog(app, { name: blogName_01 }),
      createBlog(app, { name: blogName_02 }),
      createBlog(app, { name: blogName_03 }),
      createBlog(app, { name: blogName_04 }),
      createBlog(app, { name: blogName_05 }),
      createBlog(app, { name: blogName_06 }),
      createBlog(app),
      createBlog(app),
    ]);

    const getBlogsListResponse = await getBlogsList(app, url);

    expect(getBlogsListResponse.items).toBeInstanceOf(Array);
    expect(getBlogsListResponse.items.length).toBe(5);
    expect(getBlogsListResponse.totalCount).toBe(6);
    expect(getBlogsListResponse.items[0].name).toBe(blogName_01);
    expect(getBlogsListResponse.items[1].name).toBe(blogName_02);
    expect(getBlogsListResponse.items[2].name).toBe(blogName_03);
    expect(getBlogsListResponse.items[3].name).toBe(blogName_04);
    expect(getBlogsListResponse.items[4].name).toBe(blogName_05);
  });

  it('✅ 005 should update a blog by ID; PUT /api/blogs/:id', async () => {
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
      createdAt: createdBlog.createdAt,
      isMembership: createdBlog.isMembership,
    });
  });

  it('✅ 006 should delete a blog by ID; DELETE /api/blogs/:id', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;

    await deleteBlogById(app, createdBlogId);
    await getBlogById(app, createdBlogId, HttpStatuses.NotFound_404);
  });

  it('✅ 007 should create a post for a blog by ID; POST /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;

    const createdPostInBlog: PostOutputDTO = await createPostInBlog(app, createdBlogId);
    const createdPostInBlogId: string = createdPostInBlog.id;
    const getPostByIdResponse: PostOutputDTO = await getPostById(app, createdPostInBlogId);

    expect(getPostByIdResponse).toEqual(createdPostInBlog);
    expect(getPostByIdResponse.id).toBe(createdPostInBlogId);
    expect(getPostByIdResponse.blogId).toBe(createdBlogId);
  });

  it('✅ 008 should return a list of posts for a blog by ID; GET /api/blogs/:blogId/posts', async () => {
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    await Promise.all([createPostInBlog(app, createdBlogId), createPostInBlog(app, createdBlogId)]);

    const getPostsListByBlogIdResponse = await getPostsListByBlogId(app, createdBlogId);

    expect(getPostsListByBlogIdResponse.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.items.length).toBe(2);
    expect(getPostsListByBlogIdResponse.totalCount).toBe(2);
  });

  it('✅ 009 should return a list of posts for a blog by ID when correct pagination settings passed; GET /api/blogs/:blogId/posts', async () => {
    const pageSize: number = 5;
    const pageNumber: number = 1;
    const sortDirection: string = 'asc';
    const sortBy: string = 'title';
    const createdBlog: BlogOutputDTO = await createBlog(app);
    const createdBlogId: string = createdBlog.id;
    const url: string = `${SETTINGS.BLOGS_PATH}/${createdBlogId}/posts?pageSize=${pageSize}&pageNumber=${pageNumber}&sortDirection=${sortDirection}&sortBy=${sortBy}`;

    await Promise.all([
      createPostInBlog(app, createdBlogId),
      createPostInBlog(app, createdBlogId),
      createPostInBlog(app, createdBlogId),
      createPostInBlog(app, createdBlogId),
      createPostInBlog(app, createdBlogId),
      createPostInBlog(app, createdBlogId),
    ]);

    const getPostsListByBlogIdResponse = await getPostsListByBlogId(app, createdBlogId, url);

    expect(getPostsListByBlogIdResponse.items).toBeInstanceOf(Array);
    expect(getPostsListByBlogIdResponse.items.length).toBe(5);
    expect(getPostsListByBlogIdResponse.totalCount).toBe(6);
  });
});
