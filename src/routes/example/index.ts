import { FastifyInstance, FastifyListenOptions } from 'fastify';

export default async (fastify: FastifyInstance, opts: FastifyListenOptions) => {
  fastify.get('/', async function (request, reply) {
    return 'this is an example';
  });
};
