import { body } from 'express-validator';

/*Middleware "titleValidation" проверяет, что поле "title":
1. Является строкой.
2. Состоит из не менее 1 и не более 30 символов.*/
export const titleValidation = body('title')
  .isString()
  .withMessage('title should be a string')
  .trim()
  .isLength({ min: 1, max: 30 });

/*Middleware "shortDescriptionValidation" проверяет, что поле "shortDescription":
1. Является строкой.
2. Состоит из не менее 1 и не более 100 символов.*/
export const shortDescriptionValidation = body('shortDescription')
  .isString()
  .withMessage('shortDescription should be a string')
  .trim()
  .isLength({ min: 1, max: 100 });

/*Middleware "contentValidation" проверяет, что поле "content":
1. Является строкой.
2. Состоит из не менее 1 и не более 1000 символов.*/
export const contentValidation = body('content')
  .isString()
  .withMessage('content should be a string')
  .trim()
  .isLength({ min: 1, max: 1000 });

/*Middleware "blogIdValidation" проверяет, что поле "blogId":
1. Является строкой.
2. Состоит из не менее 1 символа.*/
export const blogIdValidation = body('blogId')
  .isString()
  .withMessage('blogId should be a string')
  .trim()
  .isLength({ min: 1 });

/*Комбинируем вышеуказанные middlewares в один middleware "postCreateInputValidation", чтобы использовать его для
проверки запросов на создание постов.*/
export const postCreateInputValidation = [
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdValidation,
];

/*Комбинируем вышеуказанные middlewares в один middleware "postUpdateInputValidation", чтобы использовать его для
проверки запросов на изменение постов.*/
export const postUpdateInputValidation = [
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdValidation,
];

/*Комбинируем вышеуказанные middlewares в один middleware "postInExistingBlogCreateInputValidation", чтобы использовать
его для проверки запросов на создание постов в существующем блоге.*/
export const postInExistingBlogCreateInputValidation = [titleValidation, shortDescriptionValidation, contentValidation];
