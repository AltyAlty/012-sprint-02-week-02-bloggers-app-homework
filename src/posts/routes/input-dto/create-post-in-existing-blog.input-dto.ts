/*DTO для входных данных для создания нового поста в существующем блоге.*/
export type CreatePostInExistingBlogInputDTO = {
  title: string;
  shortDescription: string;
  content: string;
};
