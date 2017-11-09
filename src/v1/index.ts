import { Request, Response, Router, Express } from 'express';
import passport, { auth, authMiddleware } from './auth';
import { user } from './controllers/user';
import { team } from './controllers/team';
import { event } from './controllers/event';

//const RedisStore = connectRedis(session);

export let apiv1 = Router();

/*apiv1.use(session({
  store: new RedisStore({ url: process.env.REDIS_URL }),
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: false
}));*/
apiv1.use(passport.initialize());
apiv1.use(passport.session());

apiv1.use('/auth', auth);
apiv1.use('/user', authMiddleware, user);
apiv1.use('/team', authMiddleware, team);
apiv1.use('/event', authMiddleware, event);