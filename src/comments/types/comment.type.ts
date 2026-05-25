/*Тип для поля "CommentatorInfoType" в типе "CommentType".*/
export type CommentatorInfoType = {
  userId: string;
  userLogin: string;
};

/*Тип для комментариев.*/
export type CommentType = {
  content: string;
  postId: string;
  commentatorInfo: CommentatorInfoType;
  createdAt: Date;
};
