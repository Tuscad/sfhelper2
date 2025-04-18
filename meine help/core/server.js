import { createHash } from 'crypto';
import { DateTime } from 'luxon';
import { Mutex } from 'async-mutex';

// Replace type aliases with comments
// AccountID: number
// QueID: number
// ServerID: string

// Define your classes and interfaces as plain JavaScript objects or comments
class ServerIdent {
    constructor(url) {
        let processedUrl = url.replace(/^https:/, '').toLowerCase().replace(/\//g, '');
        let ident = processedUrl.replace(/[^a-z0-9]/g, '');

        // Create a hash of the ident
        const hash = createHash('sha256').update(ident).digest('hex');

        this.id = hash; // ServerID
        this.url = processedUrl;
        this.ident = ident;
    }
}
//CrawlerAction
class ServerInfo {
    constructor(ident, connection, headless_progress) {
        this.ident = ident; // ServerIdent
        this.accounts = new Map(); // Map<AccountID, AccountInfo>
        this.crawling = { type: 'Waiting' }; // CrawlingStatus
        this.connection = connection; // ServerConnection
        this.headless_progress = headless_progress; // Replace 'any' with the actual type
    }
}
//CrawlerServer
class Servers {
    constructor() {
        this.servers = new Map(); // Map<ServerID, ServerInfo>
    }

    getOrInsertDefault(serverIdent, connection, pb) {
        if (!this.servers.has(serverIdent.id)) {
            this.servers.set(serverIdent.id, new ServerInfo(serverIdent, connection, pb));
        }
        return this.servers.get(serverIdent.id);
    }
//Accountident
    getIdent(ident) {
        const server = this.servers.get(ident.server_id); // ServerID
        if (!server) return undefined;

        const account = server.accounts.get(ident.account); // AccountID
        if (!account) return undefined;

        return [server, account];
    }

    get(id) {
        return this.servers.get(id); // ServerID
    }

    getMut(id) {
        return this.servers.get(id); // ServerID
    }
}