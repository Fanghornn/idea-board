import 'colors';
import  * as express  from 'express';
// tslint:disable-next-line no-duplicate-imports
import { Express } from 'express';
import {
  RequestHandler,
  Request,
  Response,
} from 'express-serve-static-core';
import { Server } from 'http';
import { json } from 'body-parser';
import * as morgan from 'morgan';

import RequestFactory from 'src/bootstrap/server/utils/requestFactory';
import ResponseFactory from 'src/bootstrap/server/utils/responseFactory';
import { bootstrapRouter } from 'src/bootstrap/router/';
import { RouteHandler } from 'src/bootstrap/router/routes/utils/routeFactory';
import { HttpMethodNameLower } from 'src/bootstrap/router/constants';
import { RoutePath } from 'src/bootstrap/router/routes';

export default class ServerFactory {
  public app: Express;
  public server: Server;

  private port: string;

  public startServer() {
    const { env: { NODE_ENV, TEST_SERVER_PORT, SERVER_PORT } } = process;

    if (NODE_ENV === 'test' && !TEST_SERVER_PORT) {
      throw new Error('Missing test server port');
    }

    if (NODE_ENV !== 'test' && !SERVER_PORT) {
      throw new Error('Missing server port');
    }

    this.port = NODE_ENV === 'test'
      ? <string> TEST_SERVER_PORT
      : <string> SERVER_PORT;

    this.app = express();
    this.configureServer();

    this.server = this.listen();
  }

  public stopServer() {
    this.server.close();
  }

  public attachRouteHandler(
    httpMethod: HttpMethodNameLower,
    path: RoutePath,
    onRequest: RouteHandler,
  ) {
    this.app[httpMethod](path, (req: Request, res: Response) => {
      const response = new ResponseFactory(res);
      const request = new RequestFactory(req);
      onRequest(response, request.fetchData(httpMethod));
    });
  }

  private configureServer() {
    const { env: { NODE_ENV } } = process;
    
    if (NODE_ENV !== 'production' && NODE_ENV !== 'test') {
      this.addMiddleWare(this.createLogger());
    }

    this.addMiddleWare(json());
    bootstrapRouter(this);
  }

  private createLogger(): RequestHandler {

    return morgan('combined');
  }

  private addMiddleWare(middleware: RequestHandler) {
    this.app.use(middleware);
  }

  private listen(): Server {
    const port = this.port;
    const successMessage = `Server running on port: ${port}`.green;

    return this.app.listen(port, () => {
      console.log(successMessage);
    });
  }
}
