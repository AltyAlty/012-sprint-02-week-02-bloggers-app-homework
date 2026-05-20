import request from 'supertest';
import { Express } from 'express';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../auth/generate-admin-auth-token';
import { getCreateBlogInputDTO } from './get-create-blog-input-dto';
import { SETTINGS } from '../../../src/core/settings/settings';
import { CreateBlogInputDTO } from '../../../src/blogs/routes/input-dto/create-blog.input-dto';
import { BlogOutputDTO } from '../../../src/blogs/routes/output-dto/blog.output-dto';

/*Функция "createBlog()", создающая блог и возвращающая данные о нем, для целей тестирования.*/
export const createBlog = async (app: Express, blogDTO?: CreateBlogInputDTO): Promise<BlogOutputDTO> => {
  /*Получаем DTO с корректными данными для создания блога для целей тестирования.*/
  const testCreateBlogData: CreateBlogInputDTO = { ...getCreateBlogInputDTO(), ...blogDTO };

  /*Создаем блог.*/
  const createBlogResponse = await request(app)
    .post(SETTINGS.BLOGS_PATH)
    .set('Authorization', generateBasicAuthToken())
    .send(testCreateBlogData)
    .expect(HttpStatus.Created_201);

  /*Возвращаем тело ответа.*/
  return createBlogResponse.body;
};
