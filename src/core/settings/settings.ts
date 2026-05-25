import { SortDirection } from '../types/pagination/sort-direction';

export const SETTINGS = {
  PORT: process.env.PORT || 5003,
  MONGO_URL: process.env.MONGO_URL || '',

  BLOGS_PATH: '/api/blogs',
  POSTS_PATH: '/api/posts',
  COMMENTS_PATH: '/api/comments',
  USERS_PATH: '/api/users',
  AUTH_PATH: '/api/auth',
  TESTING_PATH: '/api/testing',

  DB_NAME: process.env.DB_NAME || '012-s-02-w-02-bloggers-app-hw',
  TEST_DB_NAME: process.env.DB_NAME || '012-s-02-w-02-bloggers-app-hw-test',

  BLOGS_COLLECTION_NAME: 'blogs',
  POSTS_COLLECTION_NAME: 'posts',
  COMMENTS_COLLECTION_NAME: 'comments',
  USERS_COLLECTION_NAME: 'users',

  DEFAULT_PAGINATION_PAGE_NUMBER: 1,
  DEFAULT_PAGINATION_PAGE_SIZE: 10,
  DEFAULT_PAGINATION_SORT_DIRECTION: SortDirection.Desc,
  DEFAULT_PAGINATION_SORT_BY: 'createdAt',

  BASIC_AUTH_ADMIN_USERNAME: process.env.BASIC_AUTH_ADMIN_USERNAME,
  BASIC_AUTH_ADMIN_PASSWORD: process.env.BASIC_AUTH_ADMIN_PASSWORD,

  AC_SECRET: process.env.AC_SECRET,
  AC_TIME: process.env.AC_TIME,
  RT_SECRET: process.env.RT_SECRET,
};
