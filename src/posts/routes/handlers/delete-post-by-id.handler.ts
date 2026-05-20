import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { postsService } from '../../application/posts.service';

/*Функция-обработчик "deletePostByIdHandler()" для DELETE-запросов для удаления поста по ID при помощи URI-параметров.*/
export const deletePostByIdHandler = async (req: Request<{ id: string }>, res: Response) => {
  try {
    /*Получаем ID поста.*/
    const postId = req.params.id;
    /*Просим сервис "postsService" удалить пост по ID.*/
    await postsService.deleteById(postId);
    /*Сообщаем клиенту, что пост был удален.*/
    res.sendStatus(HttpStatus.NoContent_204);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
