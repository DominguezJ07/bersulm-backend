import pino from 'pino';
const logger = pino({ name: 'raffle-cron' });

export const initRaffleCrons = () => {
  logger.info('Raffle cron deshabilitado: la creación de sorteos es manual (admin).');
};
