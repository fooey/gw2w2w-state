import { FastifyInstance, FastifyListenOptions } from 'fastify';
import fp from 'fastify-plugin';

module.exports = fp(async function (fastify: FastifyInstance, opts: FastifyListenOptions) {
  fastify.decorate('someSupport', function () {
    return 'hugs'
  });
});
