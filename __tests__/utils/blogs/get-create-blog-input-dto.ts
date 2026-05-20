import { CreateBlogInputDTO } from '../../../src/blogs/routes/input-dto/create-blog.input-dto';

/*Функция "getCreateBlogInputDTO()", возвращающая DTO с корректными данными для создания блога, для целей
тестирования.*/
export const getCreateBlogInputDTO = (): CreateBlogInputDTO => {
  return {
    name: 'name 01',
    description: 'description 01',
    websiteUrl: 'https://www.websiteurl01.com/blog-01',
  };
};
