import { init, startTransaction } from '@sentry/node';

init({
    dsn: process.env.DSN,
    tracesSampleRate: 1.0
});