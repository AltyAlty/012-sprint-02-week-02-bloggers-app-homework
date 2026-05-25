import { body } from 'express-validator';

/*Middleware "contentValidation" проверяет, что поле "content":
1. Является строкой.
2. Состоит из не менее 20 и не более 300 символов.*/
const contentValidation = body('content')
  .isString()
  .withMessage('content must be a string')
  .trim()
  .isLength({ min: 20, max: 300 })
  .withMessage('content is too short or too long');

/*Комбинируем вышеуказанные middlewares в один middleware "commentUpdateInputValidation", чтобы использовать его для
проверки запросов на изменение комментариев.*/
export const commentUpdateInputValidation = [contentValidation];
/*Комбинируем вышеуказанные middlewares в один middleware "commentInExistingPostCreateInputValidation", чтобы
использовать его для проверки запросов на создание комментариев в существующем посте.*/
export const commentInExistingPostCreateInputValidation = [contentValidation];
