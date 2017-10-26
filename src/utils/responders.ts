import { Response, Request } from 'express';
import { OK, INTERNAL_SERVER_ERROR, getStatusText, UNAUTHORIZED } from 'http-status-codes';

interface JSONData {
  success: boolean;
  code: number;
  url: string;
  message?: string;
  error?: any;
  data?: any;
}

export function success(req: Request, res: Response, data: any, metadata?: any): void {
  let json: JSONData = {
    success: true,
    url: req.originalUrl,
    code: OK,
    ...metadata,
    data
  }; 
  res.json(json);
}

export function serverError(req: Request, res: Response, error: any, metadata?: any): void {
  let json: JSONData = {
    success: false,
    url: req.originalUrl,
    code: INTERNAL_SERVER_ERROR,
    message: getStatusText(INTERNAL_SERVER_ERROR),
    ...metadata,
    error
  };
  res.status(INTERNAL_SERVER_ERROR).json(json);
}

export function unauthorized(req: Request, res: Response, error?: any, metadata?: any): void {
  let json: JSONData = {
    success: false,
    url: req.originalUrl,
    code: UNAUTHORIZED,
    message: getStatusText(UNAUTHORIZED),
    ...metadata,
    error
  };
  res.status(UNAUTHORIZED).json(json);
}