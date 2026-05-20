/*DTO для входных данных для создания нового поста.*/
export type CreatePostInputDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};
