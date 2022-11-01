import { FastifyInstance } from 'fastify';
import { Params as ChronJob } from 'fastify-cron';

const onTick = async (fastify: FastifyInstance) => {
  console.log(`TICK\t${new Date()}`);
};

export const tick: ChronJob = {
  cronTime: '*/10 * * * * *',
  start: true,
  runOnInit: true,
  onTick,
};
