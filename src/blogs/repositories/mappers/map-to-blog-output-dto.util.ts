import { WithId } from 'mongodb';
import { BlogType } from '../../types/blog.type';
import { BlogOutputDTO } from '../../routes/output-dto/blog.output-dto';

/*Функция "mapToBlogOutputDTO()" преобразовывает блог из БД в подготовленный для отправки клиенту блог.*/
export const mapToBlogOutputDTO = (blog: WithId<BlogType>): BlogOutputDTO => {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
  };
};
