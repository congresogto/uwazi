/** @format */
// TEST!!!

import needsAuthorization from 'api/auth/authMiddleware';
import * as usersUtils from 'api/auth2fa/usersUtils';

interface User {
  secret: string;
}

export default (app: {
  post: {
    (
      arg0: string,
      arg1: (req: any, res: any, next: any) => any,
      arg2: (req: any, res: any, next: any) => Promise<void>
    ): void;
  };
}) => {
  app.post(
    '/api/auth2fa-secret',
    needsAuthorization(['admin', 'editor']),
    async (req: any, res: any, next: any) => {
      try {
        const { otpauth, secret } = await usersUtils.setSecret(req.user);
        res.json({ otpauth, secret });
      } catch (err) {
        next(err);
      }
    }
  );

  app.post(
    '/api/auth2fa-enable',
    needsAuthorization(['admin', 'editor']),
    async (req: any, res: any, next: any) => {
      try {
        await usersUtils.enable2fa(req.user, req.body.token);
        res.json({ success: true });
      } catch (err) {
        next(err);
      }
    }
  );

  app.post(
    '/api/auth2fa-reset',
    needsAuthorization(['admin']),
    async (req: any, res: any, next: any) => {
      try {
        await usersUtils.reset2fa({ _id: req.body._id });
        res.json({ success: true });
      } catch (err) {
        next(err);
      }
    }
  );
};
