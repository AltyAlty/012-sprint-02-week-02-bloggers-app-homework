import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { usersService } from '../../application/users.service';

/*Функция-обработчик "deleteUserByIdHandler()" для DELETE-запросов для удаления пользователя по ID при помощи
URI-параметров.*/
export const deleteUserByIdHandler = async (req: Request<{ id: string }>, res: Response) => {
  try {
    /*Получаем ID пользователя.*/
    const userId = req.params.id;
    /*Просим сервис "usersService" удалить пользователя по ID.*/
    await usersService.deleteById(userId);
    /*Сообщаем клиенту, что пользователь был удален.*/
    res.sendStatus(HttpStatus.NoContent_204);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
