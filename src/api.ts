import { HTTP } from "http-call";

interface IConfig {
  baseURL: string;
}

class AhaAPI {
  http: typeof HTTP;
  config: IConfig;

  constructor(config: IConfig) {
    this.http = HTTP;
    this.config = config;
  }

  get(url: string, options: any = {}) {
    const fullURL = `${this.config.baseURL}${url}`;
    return this.http.get(fullURL, options);
  }

  put(url: string, options: any = {}) {
    const fullURL = `${this.config.baseURL}${url}`;
    return this.http.put(fullURL, options);
  }

  post(url: string, options: any = {}) {
    const fullURL = `${this.config.baseURL}${url}`;
    return this.http.post(fullURL, options);
  }

  delete(url: string, options: any = {}) {
    const fullURL = `${this.config.baseURL}${url}`;
    return this.http.delete(fullURL, options);
  }

  get defaults(): typeof HTTP.defaults {
    return this.http.defaults;
  }
}

export default AhaAPI;
