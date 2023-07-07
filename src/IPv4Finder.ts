import { captureException } from '@sentry/node';
import { getStdLogger } from './logger';
import { promisify } from 'util';
import axios, { Axios } from 'axios';

const sleep = promisify(setTimeout) as (time: number) => void;

const logger = getStdLogger();
const PUBLIC_IP_GETTER = 'https://api.myip.la';
const MAX_ERROR_COUNT = 20;

const RETRY_INTERVAL = 30000;

export class IPv4Finder {
    private errorCount = 0;
    private axiosInstance: Axios;

    constructor() {
        this.axiosInstance = axios.create({});
    }

    public async getMyIp(): Promise<string> {
        try {
            const resp = await this.axiosInstance.get(PUBLIC_IP_GETTER, {responseType: 'text'});
            this.errorCount = 0;
            return resp.data as string;
        } catch (ex) {
            logger.error(ex);
            // captureException(ex);
            this.errorCount++;
            if (this.errorCount >= MAX_ERROR_COUNT) {
                captureException(new Error('getMyIP max error count reached'));
                return null;
            }
            await sleep(RETRY_INTERVAL);
            return await this.getMyIp();
        }
    }
}