import pino from 'pino';

export function getStdLogger(base?:any): pino.Logger {
    const levels = {
        emerg: 80,
        alert: 70,
        crit: 60,
        error: 50,
        warn: 40,
        notice: 30,
        info: 20,
        debug: 10,
    };
    return pino({
        level: process.env.PINO_LOG_LEVEL || 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
        base
    });
}