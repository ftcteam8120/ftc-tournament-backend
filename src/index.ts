import * as express from 'express';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as flash from 'express-flash';
import * as mongoose from 'mongoose';
import * as cors from 'cors';
import * as bearerToken from 'express-bearer-token';
import * as shortid from 'shortid';
import passport, { auth, authMiddleware } from './v1/auth';
import { errorHandler, errorLogger } from './utils/errorHandlers';

// Set shortid characters
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

if (process.env.NODE_ENV != 'production') {
  dotenv.config();
}

import { logger, expressMiddleware } from './logger';

console.log(process.env.MONGO_URI);

(mongoose as any).Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, {
  useMongoClient: true
}).then(() => {
  logger.info('Connected to MongoDB', process.env.MONGO_URI);
}).catch((error) => {
  logger.error('Error connecting to MongoDB', process.env.MONGO_URI);
})

// Create an express server
const app = express();

// Express app configuration
app.use(cors());
app.use(bearerToken());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(flash());
app.use(expressMiddleware());
app.use(errorLogger);
app.use(errorHandler);
app.use(bodyParser.json());

import { apiv1 } from './v1/index';

app.use('/v1', apiv1);

app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ hello: "World!", user: req.user });
});

app.listen(process.env.PORT, () => {
  logger.info('Server running on port', process.env.PORT);
});