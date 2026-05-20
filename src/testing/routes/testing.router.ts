import { Router, Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { blogsCollection, postsCollection, usersCollection } from '../../db/mongodb/mongo.db';

/*Роутер из Express для тестирования приложения.*/
export const testingRouter = Router({});

/*Конфигурируем роутер "testingRouter".*/
testingRouter
  /*DELETE-запрос для очистки БД для целей тестирования.*/
  .delete('/all-data', async (req: Request, res: Response) => {
    await Promise.all([postsCollection.deleteMany(), blogsCollection.deleteMany(), usersCollection.deleteMany()]);
    res.sendStatus(HttpStatus.NoContent_204);
  });
