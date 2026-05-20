/*DTO для исходящих данных по постам.*/
export type PostOutputDTO = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
};
