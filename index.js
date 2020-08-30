import express from 'express';
import winston from 'winston';
import cors from 'cors';

import accountRouter from './routes/accountRouter.js';

const app = express();
const { combine, timestamp, label, printf } = winston.format;
const formatter = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: 'silly',
  format: combine(
      label({ label: 'grade-control.log'}),
      timestamp(),
      formatter
  ),
  transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'grades-control.log' }),
  ]
});

app.use(express.json());
app.use(cors());
app.use('/account', accountRouter);

app.listen(3031, async () => {
    try {
      logger.info('API started');
    } catch(error) {
      logger.error(error);
    }
});
