import request from 'supertest';
import { Express } from 'express';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { SETTINGS } from '../../../src/core/settings/settings';

/*Функция "clearDb()" для очистки БД перед запуском тестов.*/
export const clearDb = async (app: Express) => {
  await request(app).delete(`${SETTINGS.TESTING_PATH}/all-data`).expect(HttpStatus.NoContent_204);
  return;
};
