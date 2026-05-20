import { blogsRepository } from '../repositories/blogs.repository';
import { BlogType } from '../types/blog.type';
import { ObjectId } from 'mongodb';
import { CreateBlogInputDTO } from '../routes/input-dto/create-blog.input-dto';
import { UpdateBlogInputDTO } from '../routes/input-dto/update-blog.input-dto';
import { postsService } from '../../posts/application/posts.service';

/*Сервис "blogsService" для работы с данными по блогам.*/
export const blogsService = {
  /*Метод "create()" для добавления нового блога.*/
  async create(dto: CreateBlogInputDTO): Promise<string> {
    /*Создаем объект с данными нового блога.*/
    const newBlog: BlogType = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    };

    /*Просим репозиторий "blogsRepository" создать новый блог в БД.*/
    return blogsRepository.create(newBlog);
  },

  /*Метод "updateById()" для изменения данных блога по ID.*/
  async updateById(blogId: string, dto: UpdateBlogInputDTO): Promise<void> {
    /*Просим репозиторий "blogsRepository" изменить данные блога по ID в БД.*/
    return await blogsRepository.updateById(blogId, dto);
  },

  /*Метод "deleteById()" для удаления блога по ID.*/
  async deleteById(blogId: string): Promise<void> {
    /*Просим репозиторий "blogsRepository" проверить по ID существует ли блог в БД.*/
    await blogsRepository.findById(blogId);
    /*Если блог был найден, то просим сервис "postsService" узнать нет ли у этого блога постов.*/
    const posts = await postsService.findAllByBlogId(blogId);

    /*Если посты в блоге были найдены, то просим сервис "postsService" удалить их.*/
    if (posts) {
      const postsIds: ObjectId[] = posts.map(post => post._id);
      await postsService.deleteManyByIds(postsIds);
    }

    /*Просим репозиторий "blogsRepository" удалить блог по ID в БД.*/
    await blogsRepository.deleteById(blogId);
    return;
  },
};
