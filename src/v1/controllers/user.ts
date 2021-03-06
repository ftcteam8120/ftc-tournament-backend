import { Request, Response, Router } from 'express';
import { OK, getStatusText } from 'http-status-codes';
import { ModelType, InstanceType } from 'typegoose';
import { success, notFound } from '../../utils/responders';
import { catcher } from '../../utils/errorHandlers';
import { User, UserModel } from '../../models/User';

export let user = Router();

export function getUser(req: Request, res: Response, metadata?: any) {
  return catcher((req: Request, res: Response) => {
    if (req.user) {
      if (req.user.cleaned) {
        return success(req, res, req.user, metadata);
      }
    }
    return UserModel.findFor(req.user._id || req.params.id).then((user: InstanceType<User>) => {
      if (!user) {
        notFound(req, res);
      } else {
        success(req, res, user.clean(), metadata);
      }
    });
  });
}

user.get('/self', getUser);
user.get('/:id', getUser);