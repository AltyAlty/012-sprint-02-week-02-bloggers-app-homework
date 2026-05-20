/*Импортируем метод "param()" из библиотеки express-validator, чтобы проверять ID.*/
import { param } from 'express-validator';

/*Middleware "idValidation" проверяет, что поле "id":
1. Существует в запросе.
2. Является строкой.
3. Не является пустым.
4. Является типа ObjectId.*/
export const idValidation = param('id')
  .exists()
  .withMessage('id is required')
  .isString()
  .withMessage('id must be a string')
  .isLength({ min: 1 })
  .withMessage('id must not be empty')
  .isMongoId()
  .withMessage('Incorrect format of ObjectId');

/*Middleware "blogIdValidation" проверяет, что поле "blogId":
1. Существует в запросе.
2. Является строкой.
3. Не является пустым.
4. Является типа ObjectId.*/
export const blogIdValidation = param('blogId')
  .exists()
  .withMessage('blogId is required')
  .isString()
  .withMessage('blogId must be a string')
  .isLength({ min: 1 })
  .withMessage('blogId must not be empty')
  .isMongoId()
  .withMessage('Incorrect format of ObjectId');
