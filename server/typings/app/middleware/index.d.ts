// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAuthHandler from '../../../app/middleware/authHandler';
import ExportErrorHandler from '../../../app/middleware/errorHandler';

declare module 'egg' {
  interface IMiddleware {
    authHandler: typeof ExportAuthHandler;
    errorHandler: typeof ExportErrorHandler;
  }
}
