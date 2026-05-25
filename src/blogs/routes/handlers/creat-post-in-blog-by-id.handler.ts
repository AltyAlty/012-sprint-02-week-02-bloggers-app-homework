import { Request, Response } from 'express';
import { postsService } from '../../../posts/application/posts.service';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { CreatePostInExistingBlogInputDTO } from '../../../posts/routes/input-dto/create-post-in-existing-blog.input-dto';
import { postsQueryService } from '../../../posts/application/posts.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { ExtensionType, Result } from '../../../core/types/result/result.type';
import { PostOutputDTO } from '../../../posts/routes/output-dto/post.output-dto';

/*Функция-обработчик "createPostInExistingBlogByIdHandler()" для POST-запросов для добавления нового поста в
существующий блог по ID при помощи URI-параметров.*/
export const createPostInExistingBlogByIdHandler = async (
  req: Request<{ blogId: string }, {}, CreatePostInExistingBlogInputDTO>,
  res: Response<PostOutputDTO | ExtensionType[]>
) => {
  try {
    /*Получаем ID блога.*/
    const blogId: string = req.params.blogId;

    /*Просим сервис "postsService" создать пост в существующем блоге.*/
    const createdPostResult: Result<{ postId: string } | null> = await postsService.createInExistingBlog(
      blogId,
      req.body
    );

    /*Получаем HTTP-статус операции по созданию поста в существующем блоге.*/
    const createdPostResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(createdPostResult.status);

    /*Если пост не был создан, то сообщаем об этом клиенту.*/
    if (createdPostResultHttpStatus !== HttpStatuses.Created_201) {
      return res.status(createdPostResultHttpStatus).send(createdPostResult.extensions);
    }

    /*Если пост был создан, то просим query-сервис "postsQueryService" найти данные по созданному посту по ID.*/
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
    res.status(createdPostResultHttpStatus).send(postResult.data?.postOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
