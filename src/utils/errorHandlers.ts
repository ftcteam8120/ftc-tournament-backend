import { Request, Response, NextFunction } from 'express';
import logger from '../logger';
import { serverError } from './responders';

export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(err.stack);
  next(err);
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  serverError(req, res, err.stack);
}