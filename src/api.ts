import { Readable } from 'stream';

interface IConfig {
  baseURL: string;
}

interface RequestOptions {
  body?: any;
  headers?: Record<string, string>;
}

class AhaAPI {
  config: IConfig;
  defaults: { headers: Record<string, string> };

  constructor(config: IConfig) {
    this.config = config;
    this.defaults = { headers: {} };
  }

  async get(url: string, options?: RequestOptions) {
    return this.request('GET', url, options);
  }

  async put(url: string, options?: RequestOptions) {
    return this.request('PUT', url, options);
  }

  async post(url: string, options?: RequestOptions) {
    return this.request('POST', url, options);
  }

  async delete(url: string, options?: RequestOptions) {
    return this.request('DELETE', url, options);
  }

  private async request(method: string, url: string, options?: any) {
    const fullURL = `${this.config.baseURL}${url}`;
    const headers: Record<string, string> = {
      accept: 'application/json',
      ...this.defaults.headers,
    };

    let body: any;

    if (options) {
      if (options.headers) {
        Object.assign(headers, options.headers);
      }
      if (options.body !== undefined) {
        if (Buffer.isBuffer(options.body)) {
          body = options.body;
        } else if (options.body instanceof Readable) {
          // Read stream into buffer for fetch compatibility
          const chunks: Uint8Array[] = [];
          for await (const chunk of options.body) {
            chunks.push(
              new Uint8Array(
                Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
              )
            );
          }
          body = Buffer.concat(chunks);
        } else if (typeof options.body === 'object') {
          if (!headers['content-type']) {
            headers['content-type'] = 'application/json';
          }
          body = JSON.stringify(options.body);
        } else {
          body = options.body;
        }
      }
    }

    const response = await fetch(fullURL, { method, headers, body });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedBody: any;
      try {
        parsedBody = JSON.parse(errorText);
      } catch {
        // ignore JSON parse errors
      }
      const error: any = new Error(
        `HTTP ${response.status}: ${errorText.slice(0, 200)}`
      );
      error.http = { statusCode: response.status, body: parsedBody };
      throw error;
    }

    const contentType = response.headers.get('content-type') || '';
    const responseBody = contentType.includes('json')
      ? await response.json()
      : await response.text();

    return { body: responseBody, response };
  }
}

export default AhaAPI;
