import logger from '../logger';
import { Request, Response, Router, NextFunction } from 'express';
import * as passport from 'passport';
import * as jwt from 'jsonwebtoken';
import { Strategy as LocalStrategy } from 'passport-local';
import { ModelType, InstanceType } from 'typegoose';
import { UNAUTHORIZED, getStatusText } from 'http-status-codes';
import { success, unauthorized, serverError } from '../utils/responders';
import { getUser } from './controllers/user';

import { User, UserModel } from '../models/User';

enum LoginError {
  INCORRECT_PASSWORD = 'INCORRECT_PASSWORD',
  NOT_FOUND = 'NOT_FOUND'
}

passport.serializeUser((user: InstanceType<User>, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  UserModel.findById(id, (err, user: InstanceType<User>) => {
    done(err, user);
  });
});

passport.use(new LocalStrategy((username, password, done) => {
  UserModel.findOne({ username: username }).then((user: InstanceType<User>) => {
    if (!user) {
      done(null, false, { message: LoginError.NOT_FOUND });
    } else {
      user.validPassword(password).then(valid => {
        if (valid) {
          done(null, user.clean());
        } else {
          done(null, false, { message: LoginError.INCORRECT_PASSWORD });
        }
      }).catch(err => {
        done(err, false);
      });
    }
  }).catch((err) => {
    done(err, false);
  });
}));

export let auth = Router();

auth.get('/', (req: Request & { token: string }, res: Response) => {
  jwt.verify(req.token, process.env.SECRET, (err: Error, decoded: any) => {
    if (!err) {
      UserModel.findById(decoded.id).then((user: InstanceType<User>) => {
        success(req, res, user.clean(), { authenticated: true });
      });
    } else {
      success(req, res, {}, { authenticated: false });
    }
  });
});

auth.post('/login', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', {
    session: false
  }, (err, user, info) => {
    if (err) {
      serverError(req, res, err);
    } else {
      if (user === false) {
        unauthorized(req, res, info.message);
      } else {
        success(req, res, user, {
          token: generateJWT(user)
        });
      }
    }
  })(req, res, next);
});

function generateJWT(user: InstanceType<User>) {
  return jwt.sign({
    id: user._id,
    username: user.username
  }, process.env.SECRET, { expiresIn: '1d' });
}

export function authMiddleware(req: Request & { token: string }, res: Response, next: NextFunction) {
  jwt.verify(req.token, process.env.SECRET, (err: Error, decoded: any) => {
    if (!err) {
      UserModel.findById(decoded.id, (err, user: InstanceType<User>) => {
        req.user = user.clean();
        next();
      }).catch((error) => {
        next(error);
      });
    } else {
      unauthorized(req, res);
    }
  });
}

export default passport;