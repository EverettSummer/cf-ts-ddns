import test from 'ava';
import { IPv4Finder, PUBLIC_IP_GETTER } from './IPv4Finder';

test('All finders should return same result', async (t) => {
    t.timeout(10000);
    const finder = new IPv4Finder();
    finder.nextIpGetter(); // skip the first since it may return ipv6
    const result = [];
    for (let i = 1; i < PUBLIC_IP_GETTER.length; i++) {
        const ip = await finder.getMyIp();
        result.push(ip);

        console.log(ip);
        finder.nextIpGetter();
    }
    t.true(result[0] === result[1]);
    t.pass();
});