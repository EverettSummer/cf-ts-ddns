import axios, { Axios } from 'axios';
import { getStdLogger } from './logger';

const logger = getStdLogger();

type Record = {
    id: string;
    name: string;
    content: string;
    type: string;
}

export class CfHelper {
    private readonly zoneName: string;
    private readonly recordName: string
    private axiosInstance: Axios;
    private readonly accountId: string;
    private zoneId: string;
    private record: Record;

    constructor() {
        this.accountId = process.env.ACCOUNT_ID;
        this.zoneName = process.env.ZONE_NAME;
        this.recordName = process.env.RECORD_NAME;
        const token = process.env.AUTH_TOKEN;
        if (!this.recordName) {
            throw new Error('env DOMAIN_NAME must be set!');
        }
        if (!token) {
            throw new Error('env AUTH_TOKEN must be set!');
        }
        this.axiosInstance = axios.create({
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    public async verifyToken(): Promise<boolean> {
        try {
            const resp = await this.axiosInstance.get('https://api.cloudflare.com/client/v4/user/tokens/verify');
            logger.debug(resp.data);
            return true;
        } catch (ex) {
            logger.error(ex);
            return false;
        }
    }

    public async getRecordForDomain(): Promise<void> {
        if (!this.zoneId) {
            this.zoneId = await this.findZoneByName();
        }
        const resp = await this.axiosInstance.get(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records`, {
            params: {
                name: this.recordName
            }
        });
        logger.debug(resp.data);
        if (resp.data.success) {
            this.record = resp.data.result.find((record: any) => record.name === this.recordName);
        } else {
            throw new Error('Operation failed ' + resp.data.messages.join(','));
        }
    }

    public async update(ipv4: string): Promise<void> {
        if (!this.record) {
            logger.info('record not exists, trying to get from API');
            await this.getRecordForDomain();
            if (!this.record) {
                throw new Error('Could not get record');
            }
        }
        if (this.record && this.record.content !== ipv4) {
            logger.info('ip not match, current ip: ' + ipv4 + ' record ip: ' + this.record.content);
            this.record.content = ipv4;
            await this.axiosInstance.put(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records/${this.record.id}`, this.record);
            logger.info('ipv4 updated successfully for record');
        } else {
            logger.debug('ip matched, do nothing');
        }
    }

    public async findZoneByName(): Promise<string> {
        const resp = await this.axiosInstance.get(`https://api.cloudflare.com/client/v4/zones`, {
            params: {
                'account.id': this.accountId,
                name: this.zoneName,
                match: 'all'
            }
        });
        if (resp.data) {
            const foundZone = resp.data.result.find((zone: any) => {
                return zone.name === this.zoneName;
            });
            if (foundZone) {
                return foundZone.id;
            } else {
                throw new Error('zone not found');
            }
        } else {
            throw new Error('Operation not successful ' + resp.data.messages.join(','));
        }
    }
}