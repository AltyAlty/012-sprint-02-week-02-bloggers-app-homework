import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { CreateUserInputDTO } from '../input-dto/create-user.input-dto';
import { usersService } from '../../application/users.service';
import { usersQueryService } from '../../application/users.query-service';

/*Функция-обработчик "createUserHandler()" для POST-запросов для добавления нового пользователя.*/
export const createUserHandler = async (req: Request<{}, {}, CreateUserInputDTO>, res: Response) => {
  try {
    /*Просим сервис "usersService" создать нового пользователя.*/
    const createdUserId = await usersService.create(req.body);
    /*Просим query-сервис "usersQueryService" найти данные по созданному пользователю по ID.*/
    const userOutput = await usersQueryService.findById(createdUserId);
    /*Отправляем данные по созданному пользователю клиенту.*/
    res.status(HttpStatus.Created_201).send(userOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
