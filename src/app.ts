import AutoLoad from '@fastify/autoload';
import { FastifyInstance, FastifyListenOptions } from 'fastify';
import fastifyCron from 'fastify-cron';
import path from 'node:path';

import { jobs } from './jobs';

export default async (fastify: FastifyInstance, opts: FastifyListenOptions) => {
  // Place here your custom code!

  fastify.register(fastifyCron, { jobs });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts),
  });
};
