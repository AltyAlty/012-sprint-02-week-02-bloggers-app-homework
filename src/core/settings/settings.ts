export const SETTINGS = {
  PORT: process.env.PORT || 5003,
  MONGO_URL: process.env.MONGO_URL || '',

  BLOGS_PATH: '/api/blogs',
  POSTS_PATH: '/api/posts',
  USERS_PATH: '/api/users',
  AUTH_PATH: '/api/auth',
  TESTING_PATH: '/api/testing',

  DB_NAME: process.env.DB_NAME || '012-s-02-w-02-bloggers-app-hw',
  TEST_DB_NAME: process.env.DB_NAME || '012-s-02-w-02-bloggers-app-hw-test',

  BLOGS_COLLECTION_NAME: 'blogs',
  POSTS_COLLECTION_NAME: 'posts',
  USERS_COLLECTION_NAME: 'users',

  BASIC_AUTH_ADMIN_USERNAME: process.env.BASIC_AUTH_ADMIN_USERNAME,
  BASIC_AUTH_ADMIN_PASSWORD: process.env.BASIC_AUTH_ADMIN_PASSWORD,
};
