import { createRequest } from './requestwrapper';
import { BaseService } from './base-service';
import * as url from 'url';

export class AuthorizationV1 extends BaseService {
  name;
  version;
  static URL: string = 'https://stream.watsonplatform.net/authorization/api';

  /**
   * Authorization Service
   *
   * Generates temporary auth tokens for use in untrusted environments.
   * Tokens expire after one hour.
   *
   * @param {Object} options
   * @param {String} options.username
   * @param {String} options.password
   * @param {String} [options.url] url of the service for which auth tokens are being generated
   * @constructor
   */
  constructor(options) {
    super(options);
    this['target_url'] = options.url;
    // replace the url to always point to /authorization/api
    const hostname = url.parse(this._options.url);
    hostname.pathname = '/authorization/api';
    this._options.url = url.format(hostname);
  }

  /**
   * Get a percent-encoded authorization token based on resource query string param
   *
   * @param {Object} [options]
   * @param {String} [options.url] defaults to url supplied to constructor (if any)
   * @param {Function(err, token)} callback - called with a %-encoded token
   */
  getToken(params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = { url: this['target_url'] };
    }
    if (!params.url) {
      callback(new Error('Missing required parameters: url'));
      return;
    }

    const parameters = {
      options: {
        method: 'GET',
        url: '/v1/token?url=' + params.url
      },
      defaultOptions: this._options
    };
    return createRequest(parameters, callback);
  }
}

AuthorizationV1.prototype.name = 'authorization';
AuthorizationV1.prototype.version = 'v1';