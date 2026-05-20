/*DTO для исходящих данных по блогам.*/
export type BlogOutputDTO = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};
