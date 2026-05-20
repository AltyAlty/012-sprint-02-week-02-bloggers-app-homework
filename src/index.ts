import 'dotenv/config';
import express from 'express';
import { setupApp } from './setup-app';
import { SETTINGS } from './core/settings/settings';
import { runDB } from './db/mongodb/mongo.db';

const bootstrap = async () => {
  /*Создаем экземпляр приложения Express.*/
  const app = express();
  /*Настраиваем экземпляр приложения Express при помощи функции "setupApp()".*/
  setupApp(app);
  /*Указываем порт для экземпляра приложения Express.*/
  const PORT = SETTINGS.PORT || 5001;
  /*Подключаемся к серверу MongoDB.*/
  await runDB(SETTINGS.MONGO_URL, SETTINGS.DB_NAME);
  /*Запускаем экземпляр приложения Express.*/
  app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`));
  return app;
};

bootstrap();
