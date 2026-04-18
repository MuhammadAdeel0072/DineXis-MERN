const dns = require('dns').promises;

const hosts = [
    'ac-lsxddw8-shard-00-00.awtsv6c.mongodb.net',
    'ac-lsxddw8-shard-00-01.awtsv6c.mongodb.net',
    'ac-lsxddw8-shard-00-02.awtsv6c.mongodb.net',
    'ak-7rest.awtsv6c.mongodb.net'
];

async function checkHosts() {
    console.log('--- Checking DNS Resolution ---');
    for (const host of hosts) {
        try {
            const result = await dns.lookup(host);
            console.log(`✅ ${host}: ${result.address}`);
        } catch (err) {
            console.error(`❌ ${host}: ${err.code} (${err.message})`);
        }
    }
}

checkHosts();
