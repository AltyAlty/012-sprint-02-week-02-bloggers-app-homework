import request from 'supertest';
import { Express } from 'express';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../auth/generate-admin-auth-token';
import { SETTINGS } from '../../../src/core/settings/settings';
import { BlogOutputDTO } from '../../../src/blogs/routes/output-dto/blog.output-dto';

/*Функция "getBlogById()", получающая данные о блоге по ID и возвращающая их, для целей тестирования.*/
export const getBlogById = async (app: Express, blogId: string): Promise<BlogOutputDTO> => {
  /*Получаем данные о блоге.*/
  const getBlogResponse = await request(app).get(`${SETTINGS.BLOGS_PATH}/${blogId}`).expect(HttpStatus.Ok_200);
  /*Возвращаем тело ответа.*/
  return getBlogResponse.body;
};
