import { Request, Response } from 'express';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { CreateUserInputDTO } from '../input-dto/create-user.input-dto';
import { usersService } from '../../application/users.service';
import { usersQueryService } from '../../application/users.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { ExtensionType, Result } from '../../../core/types/result/result.type';
import { UserOutputDTO } from '../output-dto/user.output-dto';

/*Функция-обработчик "createUserHandler()" для POST-запросов для добавления нового пользователя.*/
export const createUserHandler = async (
  req: Request<{}, {}, CreateUserInputDTO>,
  res: Response<UserOutputDTO | ExtensionType[]>
) => {
  try {
    /*Просим сервис "usersService" создать нового пользователя.*/
    const createdUserResult: Result<{ userId: string }> = await usersService.create(req.body);
    /*Получаем HTTP-статус операции по созданию нового пользователя.*/
    const createdUserResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(createdUserResult.status);

    /*Просим query-сервис "usersQueryService" найти данные по созданному пользователю по ID.*/
    const userResult: Result<{ userOutput: UserOutputDTO } | null> = await usersQueryService.findById(
      createdUserResult.data.userId
    );

    /*Получаем HTTP-статус операции по поиску данных по созданному пользователю по ID.*/
    const userResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(userResult.status);

    /*Если данные по созданному пользователю не были найдены, то сообщаем об этом клиенту.*/
    if (userResultHttpStatus !== HttpStatuses.Ok_200) {
      return res.status(userResultHttpStatus).send(userResult.extensions);
    }

    /*Если данные по созданному пользователю были найдены, то отправляем их клиенту.*/
    res.status(createdUserResultHttpStatus).send(userResult.data!.userOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
