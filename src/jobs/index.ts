import { Params as ChronJob } from 'fastify-cron';

import { tick } from './tick/tick';

export const jobs: ChronJob[] = [tick];
