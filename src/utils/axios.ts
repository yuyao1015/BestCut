import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';

import axios from 'axios';

const METHODS = ['get', 'post', 'delete', 'put', 'patch', 'options'];

type IOKeys = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'options';
type AxiosIOMethods = Pick<AxiosInstance, IOKeys>;

interface InterceptorPair<T> {
  fulfilled?: (value: T) => T | Promise<T>;
  rejected?: (error: unknown) => Promise<never>;
}

export type Interceptor = InterceptorPair<AxiosRequestConfig> | InterceptorPair<AxiosResponse>;

interface Handler {
  request: InterceptorPair<AxiosRequestConfig>[];
  response: InterceptorPair<AxiosResponse>[];
}

type IOMethod = <T, R extends AxiosResponse<T>>(
  url: string,
  config?: AxiosRequestConfig
) => Promise<R>;
type IOMethodWithData = <T, R extends AxiosResponse<T>>(
  url: string,
  data?: Record<string, number | string>,
  config?: AxiosRequestConfig
) => Promise<R>;

export default class Axios {
  private axios: AxiosInstance = axios.create();

  private handler: Handler = { request: [], response: [] };

  public get: IOMethod = this.axios.get;

  public delete: IOMethod = this.axios.delete;

  public options: IOMethod = this.axios.options;

  public put: IOMethodWithData = this.axios.put;

  public post: IOMethodWithData = this.axios.post;

  public patch: IOMethodWithData = this.axios.patch;

  constructor(options: AxiosRequestConfig, interceptors: Interceptor[] = []) {
    // super();
    this.setOptions(options);
    for (const interceptor of interceptors) {
      this.addInterceptor(interceptor);
    }
    this.register();
  }

  setOptions(options: AxiosRequestConfig) {
    this.axios = axios.create(options);
    this.setInterceptors();
  }

  register() {
    (METHODS as (keyof AxiosIOMethods)[]).forEach((method) => {
      this[method] = this.axios[method];
    });
  }

  setHeader(headers: unknown) {
    Object.assign(this.axios.defaults.headers, headers);
  }

  setInterceptors() {
    this.handler.request.forEach((pair) => {
      this.axios.interceptors.request.use(pair.fulfilled, pair.rejected);
    });
    this.handler.response.forEach((pair) => {
      this.axios.interceptors.response.use(pair.fulfilled, pair.rejected);
    });
  }

  static isRequest(interceptor: Interceptor): interceptor is InterceptorPair<AxiosRequestConfig> {
    return typeof (interceptor as Interceptor).fulfilled?.name === 'undefined';
  }

  static isResponse(interceptor: Interceptor): interceptor is InterceptorPair<AxiosResponse> {
    return typeof (interceptor as Interceptor).fulfilled?.name === 'undefined';
  }

  addInterceptor(interceptor: Interceptor) {
    if (Axios.isRequest(interceptor)) this.handler.request.push(interceptor);
    else this.handler.response.push(interceptor);
  }

  clearInterceptor() {
    this.handler = { request: [], response: [] };
  }

  // rmInterceptor() {}
}
