import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { applyDefaultPaginationSettings } from '../../../core/utils/pagination/apply-default-pagination-settings';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { GetUsersListQueryInputDTO } from '../input-dto/get-users-list-query.input-dto';
import { usersQueryService } from '../../application/users.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { PaginatedUsersListOutputDTO } from '../output-dto/paginated-users-list.output-dto';
import { Result } from '../../../core/types/result/result.type';
import { HttpStatuses } from '../../../core/types/http-statuses';

/*Функция-обработчик "getUsersListHandler()" для GET-запросов для получения данных по всем пользователям при помощи
query-параметров.*/
export const getUsersListHandler = async (
  req: Request<{}, {}, {}, GetUsersListQueryInputDTO>,
  res: Response<PaginatedUsersListOutputDTO>
) => {
  try {
    /*Функция "matchedData()" из библиотеки express-validator берет из объекта "req" только те поля, которые ранее
    прошли через валидаторы и санитайзеры на основе библиотеки express-validator.*/
    const sanitizedQueryInput = matchedData<GetUsersListQueryInputDTO>(req, {
      /*Берем данные только из объекта "req.query".*/
      locations: ['query'],
      /*Включаем опциональные поля - те, для которых в валидаторах использовался метод "optional()", даже если они не
      пришли в запросе или были пропущены.*/
      includeOptionals: true,
    });

    /*Добавляем к объекту с query-параметрами поля, чтобы этот объект соответствовал типу
    "defaultPaginationSettingsType".*/
    const sanitizedQueryInputWithDefaultPaginationSettings = applyDefaultPaginationSettings(sanitizedQueryInput);

    /*Просим query-сервис "usersQueryService" найти данные по пользователям.*/
    const paginatedUsersListResult: Result<{ paginatedUsersListOutput: PaginatedUsersListOutputDTO }> =
      await usersQueryService.findMany(sanitizedQueryInputWithDefaultPaginationSettings);

    /*Получаем HTTP-статус операции по поиску данных по пользователям.*/
    const paginatedUsersListResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(paginatedUsersListResult.status);
    /*Отправляем данные по пользователям клиенту.*/
    res.status(paginatedUsersListResultHttpStatus).send(paginatedUsersListResult.data.paginatedUsersListOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
