import { IdType } from '../../../core/types/id.type';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { Request, Response } from 'express';
import { usersQueryService } from '../../../users/application/users.query-service';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';

/*Функция-обработчик "getAuthDataByTokenHandler()" для GET-запросов для получения данных пользователя по токену.*/
export const getAuthDataByTokenHandler = async (req: Request<{}, {}, {}, {}, IdType>, res: Response) => {
  try {
    /*Получаем ID пользователя.*/
    const userId = req.userId?.id as string;
    /*Если ID пользователя получить не удалось, то сообщаем клиенту об отказе в аутентификации.*/
    if (!userId) return res.sendStatus(HttpStatuses.Unauthorized_401);
    /*Просим query-сервис "usersQueryService" найти данные по пользователю по ID.*/
    const userResult = await usersQueryService.findById(userId);
    /*Получаем HTTP-статус операции по поиску данных по пользователю по ID.*/
    const userResultHttpStatus = mapResultCodeToHttpStatus(userResult.status);

    /*Если данные по пользователю не были найдены, то сообщаем об этом клиенту.*/
    if (userResultHttpStatus !== HttpStatuses.Ok_200) {
      return res.status(userResultHttpStatus).send(userResult.extensions);
    }

    /*Если данные по пользователю были найдены, то отправляем их клиенту.*/
    return res.status(userResultHttpStatus).send(userResult.data?.userOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
