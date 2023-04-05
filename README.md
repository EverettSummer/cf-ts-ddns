DDNS with cloudflare

only support A/AAAA record

## ENV:
- DSN: sentry dsn
- ACCOUNT_ID: account id, you can find this in the url of your cloudflare dashboard
- ZONE_NAME: zone name, for example: your root domain
- RECORD_NAME: record name, for example: your subdomain.example.com
- AUTH_TOKEN: go to My Profile - API Tokens. choose the DNS template
- PINO_LOG_LEVEL: optional, only used for debug