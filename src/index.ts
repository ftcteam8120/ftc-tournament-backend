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
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';

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
import { Scopes, defaultScopes } from './v1/scopes';

app.use('/v1', apiv1);

import { graphqlAuth, websocketAuth } from './v1/auth';

app.use('/graphql', bodyParser.json(), graphqlAuth, (req: any, res, next) => {
  let scopes;
  if (req.scopes) {
    scopes = req.scopes;
  } else {
    scopes = defaultScopes;
  }
  graphqlExpress({ schema, context: { user: req.user, scopes } })(req, res, next);
});

if (process.env.NODE_ENV !== 'production') {
  app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
}

/*app.listen(process.env.PORT, () => {
  logger.info('Server running on port', process.env.PORT);
});*/

// Create WebSocket listener server
const httpServer = createServer(app);

const subscriptionServer = SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
    onConnect: (connectionParams, webSocket) => {
      if (connectionParams.Authorization) {
        return websocketAuth(connectionParams.Authorization).then((user) => {
            return {
              user: user
            };
        });
      }
    }
  },
  {
    server: httpServer,
    path: '/websocket',
  },
);

httpServer.listen(process.env.PORT, () => {
  logger.info('Server running on port', process.env.PORT);
});