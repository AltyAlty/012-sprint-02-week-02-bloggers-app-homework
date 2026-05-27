import { WithId } from 'mongodb';
import { PostType } from '../../types/post.type';
import { PostOutputDTO } from '../../routes/output-dto/post.output-dto';

/*Функция "mapToPostOutputDTO()" преобразовывает пост из БД в подготовленный для отправки клиенту пост.*/
export const mapToPostOutputDTO = (post: WithId<PostType>): PostOutputDTO => {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
  };
};
