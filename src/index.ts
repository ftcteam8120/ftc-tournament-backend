import * as express from 'express';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as cors from 'cors';
import * as flash from 'express-flash';
import * as bearerToken from 'express-bearer-token';
import * as shortid from 'shortid';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { errorHandler, errorLogger } from './utils/errorHandlers';

// Set shortid characters
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

if (process.env.NODE_ENV != 'production') {
  dotenv.config();
}

import { logger, expressMiddleware } from './logger';

(mongoose as any).Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, {
  useMongoClient: true
}).then(() => {
  logger.info('Connected to MongoDB');
}).catch((error) => {
  logger.error('Error connecting to MongoDB', process.env.MONGO_URI);
})

// Create an express server
const app = express();

// Express app configuration
app.use(cors());
app.use(bearerToken());
app.use(flash());
app.use(bodyParser.json());
app.use(errorLogger);
app.use(errorHandler);

import schema from './schema';

import { apiv1 } from './v1/index';

app.use('/v1', apiv1);

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
if (process.env.NODE_ENV !== 'production') {
  app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
}

app.listen(process.env.PORT, () => {
  logger.info('Server running on port', process.env.PORT);
});