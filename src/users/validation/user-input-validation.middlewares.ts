import { body } from 'express-validator';

/*Middleware "loginValidation" проверяет, что поле "login":
1. Является строкой.
2. Состоит из не менее 3 и не более 10 символов.
3. Содержит только буквы, цифры, нижние подчеркивания и тире.*/
const loginValidation = body('login')
  .isString()
  .withMessage('login should be a string')
  .trim()
  .isLength({ min: 3, max: 10 })
  .withMessage('login is too short or too long')
  .matches(/^[a-zA-Z0-9_-]*$/)
  .withMessage('login can only contain letters, numbers, underscores and hyphens');

/*Middleware "passwordValidation" проверяет, что поле "password":
1. Является строкой.
2. Состоит из не менее 6 и не более 20 символов.*/
const passwordValidation = body('password')
  .isString()
  .withMessage('password should be a string')
  .trim()
  .isLength({ min: 6, max: 20 })
  .withMessage('password is too short or too long');

/*Middleware "emailValidation" проверяет, что поле "email":
1. Является строкой.
2. Соответствует формату электронной почты.*/
const emailValidation = body('email')
  .isString()
  .withMessage('email should be a string')
  .trim()
  .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
  .withMessage('email has wrong format')
  .isEmail()
  .withMessage('email has wrong format');

/*Комбинируем вышеуказанные middlewares в один middleware "userCreateInputValidation", чтобы использовать его для
проверки запросов на создание пользователей.*/
export const userCreateInputValidation = [loginValidation, passwordValidation, emailValidation];
