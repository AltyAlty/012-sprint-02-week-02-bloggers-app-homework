import { CommentatorInfoType } from '../../types/comment.type';

/*DTO для исходящих данных по комментариям.*/
export type CommentOutputDTO = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoType;
  createdAt: Date;
};
