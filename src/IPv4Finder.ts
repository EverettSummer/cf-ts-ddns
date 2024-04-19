import { captureException } from '@sentry/node';
import { getStdLogger } from './logger';
import { promisify } from 'util';
import axios, { Axios } from 'axios';

const sleep = promisify(setTimeout);

const logger = getStdLogger();
export const PUBLIC_IP_GETTER = ['https://api.myip.la', 'https://api.ipify.org', 'https://res.iroha.io/myip'];
const MAX_ERROR_COUNT = 20;

const RETRY_INTERVAL = 30000;

export class IPv4Finder {
    private errorCount = 0;
    private axiosInstance: Axios;
    private _ipGetter: string;
    private _ipGetterIdx = 0;

    constructor() {
        this.axiosInstance = axios.create({});
        this._ipGetter = PUBLIC_IP_GETTER[this._ipGetterIdx];
    }

    public async getMyIp(): Promise<string> {
        try {
            const resp = await this.axiosInstance.get(this._ipGetter, {responseType: 'text'});
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
            this.nextIpGetter();
            await sleep(RETRY_INTERVAL);
            return await this.getMyIp();
        }
    }

    public nextIpGetter(): void {
        this._ipGetterIdx++;
        if (this._ipGetterIdx >= PUBLIC_IP_GETTER.length) {
            this._ipGetterIdx = 0;
        }
        this._ipGetter = PUBLIC_IP_GETTER[this._ipGetterIdx];
    }
}