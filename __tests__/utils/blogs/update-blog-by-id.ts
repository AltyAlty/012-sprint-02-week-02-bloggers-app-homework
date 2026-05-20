import request from 'supertest';
import { Express } from 'express';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../auth/generate-admin-auth-token';
import { SETTINGS } from '../../../src/core/settings/settings';
import { getUpdateBlogInputDTO } from './get-update-blog-input-dto';
import { UpdateBlogInputDTO } from '../../../src/blogs/routes/input-dto/update-blog.input-dto';

/*Функция "updateBlogById()", изменяющая данные блога по ID и возвращающую их, для целей тестирования.*/
export const updateBlogById = async (app: Express, blogId: string, blogDTO?: UpdateBlogInputDTO): Promise<void> => {
  /*Получаем DTO с корректными данными для изменения блога для целей тестирования.*/
  const testUpdateBlogData: UpdateBlogInputDTO = { ...getUpdateBlogInputDTO(), ...blogDTO };

  /*Изменяем блог.*/
  const updateBlogResponse = await request(app)
    .put(`${SETTINGS.BLOGS_PATH}/${blogId}`)
    .set('Authorization', generateBasicAuthToken())
    .send(testUpdateBlogData)
    .expect(HttpStatus.NoContent_204);

  /*Возвращаем тело ответа.*/
  return updateBlogResponse.body;
};
