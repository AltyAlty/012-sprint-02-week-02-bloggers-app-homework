import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { postsQueryService } from '../../application/posts.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { ExtensionType, Result } from '../../../core/types/result/result.type';
import { PostOutputDTO } from '../output-dto/post.output-dto';

/*Функция-обработчик "getPostByIdHandler()" для GET-запросов для поиска поста по ID при помощи URI-параметров.*/
export const getPostByIdHandler = async (
  req: Request<{ id: string }>,
  res: Response<PostOutputDTO | ExtensionType[]>
) => {
  try {
    /*Получаем ID поста.*/
    const postId: string = req.params.id;
    /*Просим query-сервис "postsQueryService" найти данные по посту по ID.*/
    const postResult: Result<{ postOutput: PostOutputDTO } | null> = await postsQueryService.findById(postId);
    /*Получаем HTTP-статус операции по поиску данных по посту по ID.*/
    const postResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(postResult.status);

    /*Если данные по посту не были найдены, то сообщаем об этом клиенту.*/
    if (postResultHttpStatus !== HttpStatuses.Ok_200) {
      return res.status(postResultHttpStatus).send(postResult.extensions);
    }

    /*Если данные по посту были найдены, то отправляем их клиенту.*/
    res.status(postResultHttpStatus).send(postResult.data?.postOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
