import { Request, Response, Router } from 'express';
import { OK, getStatusText } from 'http-status-codes';
import { ModelType, InstanceType } from 'typegoose';
import { success } from '../../utils/responders';
import { User, UserModel } from '../../models/User';

export let user = Router();

export function getUser(req: Request, res: Response, metadata?: any) {
  if (req.user) {
    if (req.user.cleaned) {
      return success(req, res, req.user, metadata);
    }
  }
  UserModel.findById(req.user._id || req.params.id).then((user: InstanceType<User>) => {
    success(req, res, user.clean(), metadata);
  });
}

user.get('/self', getUser);
user.get('/:id', getUser);