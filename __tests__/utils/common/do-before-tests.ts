import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { runDB, stopDb } from '../../../src/db/mongodb/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import { clearDb } from '../db/clear-db';

/*Функция "doBeforeTests()" для предварительных действий перед запуском тестов.*/
export const doBeforeTests = () => {
  /*Создаем экземпляр приложения Express.*/
  const app = express();
  /*Настраиваем экземпляр приложения Express при помощи функции "setupApp()".*/
  setupApp(app);

  /*Указываем, что перед запуском тестового набора будет запускаться и очищаться БД.*/
  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL, SETTINGS.TEST_DB_NAME);
    await clearDb(app);
  });

  /*Указываем, что перед запуском каждого теста будет очищаться БД.*/
  beforeEach(async () => await clearDb(app));

  /*Указываем, что после того как тестовый набор отработает, будет очищать и отключаться от БД.*/
  afterAll(async () => {
    await clearDb(app);
    await stopDb();
  });

  /*Возвращаем настроенный экземпляр приложения Express.*/
  return app;
};
