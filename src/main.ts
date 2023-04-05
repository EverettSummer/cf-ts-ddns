import { CfHelper } from './CfHelper';
import './sentry';
import { captureException } from '@sentry/node';
import { getStdLogger } from './logger';
import { IPv4Finder } from './IPv4Finder';

const logger = getStdLogger();
const CHECK_INTERVAL = 60000;

const cf = new CfHelper();
const myIpFinder = new IPv4Finder();

async function checkAndUpdate() {
    if (!await cf.verifyToken()) {
        const err = new Error('token verify failed');
        captureException(err);
        logger.error(err);
        return;
    }

    const ipv4 = await myIpFinder.getMyIp();
    if (ipv4) {
        await cf.update(ipv4);
    }

    setTimeout(async () => {
        await checkAndUpdate();
    }, CHECK_INTERVAL);
}

checkAndUpdate()
    .then(() => {
        // do nothing
    });