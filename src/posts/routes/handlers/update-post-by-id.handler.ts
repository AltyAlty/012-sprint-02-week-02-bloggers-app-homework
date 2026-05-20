import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { UpdatePostInputDTO } from '../input-dto/update-post.input-dto';
import { postsService } from '../../application/posts.service';

/*Функция-обработчик "updatePostByIdHandler()" для PUT-запросов для изменения данных поста по ID при помощи
URI-параметров.*/
export const updatePostByIdHandler = async (req: Request<{ id: string }, {}, UpdatePostInputDTO>, res: Response) => {
  try {
    /*Получаем ID поста.*/
    const postId = req.params.id;
    /*Просим сервис "postsService" изменить данные поста по ID.*/
    await postsService.updateById(postId, req.body);
    /*Сообщаем клиенту, что пост был изменен.*/
    res.sendStatus(HttpStatus.NoContent_204);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
