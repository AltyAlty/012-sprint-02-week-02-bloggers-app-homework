import jwt, { SignOptions } from 'jsonwebtoken';
import { SETTINGS } from '../../core/settings/settings';

/*Адаптер "jwtService" для работы с библиотекой jsonwebtoken.*/
export const jwtService = {
  /*Метод "createToken()" для создания JWT.*/
  async createToken(userId: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const onSignComplete = (error: Error | null, token: string | undefined): void => {
        if (error) {
          reject(error);
        } else {
          resolve(token as string);
        }
      };

      jwt.sign(
        { userId },
        SETTINGS.AC_SECRET as string,
        { expiresIn: SETTINGS.AC_TIME as SignOptions['expiresIn'] },
        onSignComplete
      );
    });

    /*Синхронная версия.*/
    // return jwt.sign({ userId }, SETTINGS.AC_SECRET as string, {
    //   expiresIn: SETTINGS.AC_TIME as SignOptions['expiresIn'],
    // });
  },

  /*Метод "verifyToken()" для верификации JWT.*/
  async verifyToken(token: string): Promise<{ userId: string } | null> {
    return new Promise(resolve => {
      const onVerifyComplete = (error: Error | null, decoded: unknown): void => {
        if (error) {
          console.log('Token verification error');
          console.log(error);
          resolve(null);
        } else {
          resolve(decoded as { userId: string });
        }
      };

      jwt.verify(token, SETTINGS.AC_SECRET as string, onVerifyComplete);
    });

    /*Синхронная версия.*/
    // try {
    //   return jwt.verify(token, SETTINGS.AC_SECRET as string) as { userId: string };
    // } catch (error) {
    //   console.error('Token verification error');
    //   console.log(error);
    //   return null;
    // }
  },
};
