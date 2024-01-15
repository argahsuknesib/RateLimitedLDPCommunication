import { Communication } from "@treecg/versionawareldesinldp";

export class RateLimitedLDPCommunication implements Communication {
    private readonly burstLimit: number;
    private readonly interval: number;
    private lastRequestTime: number;
    private tokenBucket: number;

    public constructor(burstLimit: number, interval?: number) {
        this.burstLimit = burstLimit;
        this.interval = interval || 1000;
        this.lastRequestTime = 0;
        this.tokenBucket = burstLimit;
    }

    private async waitForToken(): Promise<void> {
        const currentTime = Date.now();
        const timeSinceLastRequest = currentTime - this.lastRequestTime;
        if (timeSinceLastRequest < this.interval) {
            await new Promise(resolve => setTimeout(resolve, this.interval - timeSinceLastRequest));
        }

        this.lastRequestTime = Date.now();
        this.tokenBucket = this.burstLimit;
    }

    private async consumeToken(): Promise<void> {
        if (this.tokenBucket === 0) {
            await this.waitForToken();
        }
        this.tokenBucket -= 1;
    }

    private async fetchWithRateLimit(url: string, options: RequestInit): Promise<Response> {
        await this.consumeToken();
        try {
            const response = await fetch(url, options);
            return response;
        } catch (error: any) {
            console.log(`Request failed: ${error.message}`);
            return new Response(undefined, {
                status: 500,
                statusText: error.message,
            });
        }
    }

    public async get(resourceIdentifier: string, headers?: Headers): Promise<Response> {
        headers = headers ? headers : new Headers({
            'Content-Type': 'text/turtle',
        });
        const options: RequestInit = {
            method: "GET",
            headers: headers,
        };
        return this.fetchWithRateLimit(resourceIdentifier, options);
    }

    public async head(resourceIdentifier: string): Promise<Response> {
        const options: RequestInit = {
            method: "HEAD",
        };
        return this.fetchWithRateLimit(resourceIdentifier, options);
    }

    public async post(resourceIdentifier: string, body?: string, headers?: Headers): Promise<Response> {
        headers = headers ? headers : new Headers({
            'Content-Type': 'text/turtle',
        });
        const options: RequestInit = {
            method: "POST",
            body: body,
            headers: headers,
        };
        return this.fetchWithRateLimit(resourceIdentifier, options);
    }

    public async put(resourceIdentifier: string, body?: string, headers?: Headers): Promise<Response> {
        headers = headers ? headers : new Headers({
            'Content-Type': 'text/turtle',
        });
        const options: RequestInit = {
            method: "PUT",
            body: body,
            headers: headers,
        };
        return this.fetchWithRateLimit(resourceIdentifier, options);
    }

    public async patch(resourceIdentifier: string, body?: string, headers?: Headers): Promise<Response> {
        headers = headers ? headers : new Headers({
            'Content-Type': 'application/sparql-update',
        });
        const options: RequestInit = {
            method: "PATCH",
            body: body,
            headers: headers,
        };
        return this.fetchWithRateLimit(resourceIdentifier, options);
    }

    public async delete(resourceIdentifier: string): Promise<Response> {
        const options: RequestInit = {
            method: "DELETE",
        };
        return this.fetchWithRateLimit(resourceIdentifier, options);
    }
}
