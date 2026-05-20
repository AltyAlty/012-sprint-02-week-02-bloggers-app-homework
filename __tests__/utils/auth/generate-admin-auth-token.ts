import { SETTINGS } from '../../../src/core/settings/settings';

/*Функция "generateBasicAuthToken()" для генерации токена для Basic авторизации для целей тестирования.*/
export const generateBasicAuthToken = () => {
  const credentials = `${SETTINGS.BASIC_AUTH_ADMIN_USERNAME}:${SETTINGS.BASIC_AUTH_ADMIN_PASSWORD}`;
  const token = Buffer.from(credentials).toString('base64');
  return `Basic ${token}`;
};
