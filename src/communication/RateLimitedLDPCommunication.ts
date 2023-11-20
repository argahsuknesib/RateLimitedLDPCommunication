export class RateLimitedLDPCommunication {
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

    private async fetchWithRateLimit(url: string, options: RequestInit | null): Promise<Response | null> {
        await this.consumeToken();
        try {
            if (options !== null) {
                const response = await fetch(url, options);
                if (!response.ok) {
                    console.log(`Request failed with status: ${response.status}`);
                    return null;
                }
                return response;
            } else {
                return null;
            }
        } catch (error: any) {
            console.log(`Request failed: ${error.message}`);
            return null;
        }
    }

    public async get(resourceIdentifier: string, headers?: Headers): Promise<Response | null> {
        const requestOptions: RequestInit | null = headers
            ? { method: "GET", headers: headers }
            : null;

        return this.fetchWithRateLimit(resourceIdentifier, requestOptions);
    }

    public async head(resourceIdentifier: string): Promise<Response | null> {
        const options: RequestInit = {
            method: "HEAD",
        };
        return this.fetchWithRateLimit(resourceIdentifier, options);
    }

    public async post(resourceIdentifier: string, body?: string, headers?: Headers): Promise<Response | null> {
        const options: RequestInit | null = headers
            ? { method: "POST", headers: headers, body: body }
            : null;
        return this.fetchWithRateLimit(resourceIdentifier, options);
    }

    public async put(resourceIdentifier: string, body?: string, headers?: Headers): Promise<Response | null> {
        const options: RequestInit | null = headers
            ? { method: "PUT", headers: headers, body: body }
            : null;
        return this.fetchWithRateLimit(resourceIdentifier, options);
    }

    public async patch(resourceIdentifier: string, body?: string, headers?: Headers): Promise<Response | null> {
        const options: RequestInit | null = headers
            ? { method: "PATCH", headers: headers, body: body }
            : null;
        return this.fetchWithRateLimit(resourceIdentifier, options);
    }

    public async delete(resourceIdentifier: string): Promise<Response | null> {
        const options: RequestInit | null = {
            method: "DELETE",
        };
        return this.fetchWithRateLimit(resourceIdentifier, options);
    }
}
