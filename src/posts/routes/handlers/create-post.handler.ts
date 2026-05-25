import { Request, Response } from 'express';
import { postsService } from '../../application/posts.service';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { CreatePostInputDTO } from '../input-dto/create-post.input-dto';
import { postsQueryService } from '../../application/posts.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { ExtensionType, Result } from '../../../core/types/result/result.type';
import { PostOutputDTO } from '../output-dto/post.output-dto';

/*Функция-обработчик "createPostHandler()" для POST-запросов для добавления нового поста.*/
export const createPostHandler = async (
  req: Request<{}, {}, CreatePostInputDTO>,
  res: Response<PostOutputDTO | ExtensionType[]>
) => {
  try {
    /*Просим сервис "postsService" создать новый пост.*/
    const createdPostResult: Result<{ postId: string } | null> = await postsService.create(req.body);
    /*Получаем HTTP-статус операции по созданию нового поста.*/
    const createdPostResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(createdPostResult.status);

    /*Просим query-сервис "postsQueryService" найти данные по созданному посту по ID.*/
    const postResult: Result<{ postOutput: PostOutputDTO } | null> = await postsQueryService.findById(
      createdPostResult.data!.postId
    );

    /*Получаем HTTP-статус операции по поиску данных по созданному посту по ID.*/
    const postResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(postResult.status);

    /*Если данные по созданному посту не были найдены, то сообщаем об этом клиенту.*/
    if (postResultHttpStatus !== HttpStatuses.Ok_200) {
      return res.status(postResultHttpStatus).send(postResult.extensions);
    }

    /*Если данные по созданному посту были найдены, то отправляем их клиенту.*/
    res.status(createdPostResultHttpStatus).send(postResult.data!.postOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
