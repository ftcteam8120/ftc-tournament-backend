import { Request, Response, NextFunction } from 'express';
import logger from '../logger';
import { serverError } from './responders';

export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(err.stack);
  next(err);
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  serverError(req, res, err.message);
}

export function catcher(handler: (req: Request, res: Response, next?: NextFunction) => any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const promise = handler(req, res, next);
    if (promise) {
      if (promise.catch) {
        promise.catch((err: Error) => {
          serverError(req, res, err.message);
        });
      }
    }
  }
}