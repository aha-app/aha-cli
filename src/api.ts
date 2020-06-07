import { HTTP, HTTPError, HTTPRequestOptions } from "http-call";
import Debug from "debug";
const debug = Debug("aha");

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
    return this.http.get(fullURL);
  }

  put(url: string, options: any = {}) {
    const fullURL = `${this.config.baseURL}${url}`;
    return this.http.put(fullURL, options);
  }

  post(url: string, options: any = {}) {
    const fullURL = `${this.config.baseURL}${url}`;
    return this.http.post(fullURL, options);
  }

  get defaults(): typeof HTTP.defaults {
    return this.http.defaults;
  }
}

export default AhaAPI;
