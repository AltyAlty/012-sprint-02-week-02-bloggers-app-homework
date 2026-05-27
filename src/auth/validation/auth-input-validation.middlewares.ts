import { body } from 'express-validator';

/*Middleware "loginOrEmail" проверяет, что поле "login" является строкой.*/
const loginOrEmailValidation = body('loginOrEmail')
  .isString()
  .withMessage('loginOrEmail must be a string')
  .trim()
  .isLength({ min: 1 })
  .withMessage('loginOrEmail is too short');

/*Middleware "passwordValidation" проверяет, что поле "password":
1. Является строкой.
2. Состоит из не менее 6 и не более 20 символов.*/
const passwordValidation = body('password')
  .isString()
  .withMessage('password must be a string')
  .trim()
  .isLength({ min: 6, max: 20 })
  .withMessage('password is too short or too long');

/*Комбинируем вышеуказанные middlewares в один middleware "authUserPostInputValidation", чтобы использовать его для
проверки запросов по аутентификации пользователя.*/
export const authUserPostInputValidation = [loginOrEmailValidation, passwordValidation];
