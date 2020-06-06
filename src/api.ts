import {HTTP, HTTPError, HTTPRequestOptions} from 'http-call'
import Debug from "debug";
const debug = Debug("aha");

interface IConfig {
  baseURL: string,
  token: string,
}

class AhaAPI {
  http: typeof HTTP;

  constructor(config: IConfig) {
    this.http = HTTP;
    this.config = config;
  }


  get(url: string) {
    const fullURL = `${this.config.baseURL}${url}`;
    debug(`HTTP GET ${fullURL}`)
    return this.http.get(fullURL);
  }

  get defaults(): typeof HTTP.defaults {
    return this.http.defaults
  }
}

export default AhaAPI;
