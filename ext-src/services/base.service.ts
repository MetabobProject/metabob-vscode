import axios, { AxiosRequestConfig } from 'axios'
import { err, ok, Result } from 'rusty-result-ts'
import { GetAPIBaseURLConfig } from '../config'
import { ApiErrorBase } from './base.error'
import FormData from 'form-data'

const apiBase = GetAPIBaseURLConfig()

export class ApiServiceBase {
  protected urlBase = apiBase === undefined || apiBase === '' ? 'https://ide.metabob.com' : apiBase

  /**
   * Creates a new service instance.
   * @param path A base path for all requests this service will make. Defaults to `/api`.
   */
  public constructor() {
    this.urlBase = apiBase === undefined || apiBase === '' ? 'https://ide.metabob.com' : apiBase
  }

  /**
   * Returns a new instance of the base config for all requests this service makes.
   * @protected
   */
  protected getConfig(sessionToken?: string, formDataHeaders?: FormData.Headers): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }

    if (sessionToken && config.headers) {
      config.headers.Authorization = `Bearer ${sessionToken}`
    }

    if (formDataHeaders && config.headers) {
      config.headers = {
        ...config.headers,
        ...formDataHeaders
      }
    }

    return config
  }

  /**
   * Make a GET request.
   * @param path A path to append to the base url.
   * @param configOverrides A config object to merge onto the base config.
   * @protected
   */
  protected async get<T>(path = '', configOverrides: AxiosRequestConfig): Promise<Result<T | null, ApiErrorBase>> {
    return await this.requestResultWrapper<T>(path, configOverrides, (fullPath, config) => {
      return axios.get(fullPath, config)
    })
  }

  /**
   * Make a POST request.
   * @param path A path to append to the base url.
   * @param data Optional data to send with the request.
   * @param configOverrides A config object to merge onto the base config.
   * @protected
   */
  protected async post<T>(
    path = '',
    data: unknown = undefined,
    configOverrides: AxiosRequestConfig
  ): Promise<Result<T | null, ApiErrorBase>> {
    return await this.requestResultWrapper<T>(path, configOverrides, (fullPath, config) => {
      return axios.post(fullPath, data, config)
    })
  }

  /**
   * Make a PUT request.
   * @param path A path to append to the base url.
   * @param data Optional data to send with the request.
   * @param configOverrides A config object to merge onto the base config.
   * @protected
   */
  protected async put<T>(
    path = '',
    data: unknown = undefined,
    configOverrides: AxiosRequestConfig
  ): Promise<Result<T | null, ApiErrorBase>> {
    return await this.requestResultWrapper<T>(path, configOverrides, (fullPath, config) => {
      return axios.put(fullPath, data, config)
    })
  }

  /**
   * Make a PATCH request.
   * @param path A path to append to the base url.
   * @param data Optional data to send with the request.
   * @param configOverrides A config object to merge onto the base config.
   * @protected
   */
  protected async patch<T>(
    path = '',
    data: unknown = undefined,
    configOverrides: AxiosRequestConfig
  ): Promise<Result<T | null, ApiErrorBase>> {
    return await this.requestResultWrapper<T>(path, configOverrides, (fullPath, config) => {
      return axios.patch(fullPath, data, config)
    })
  }

  /**
   * Make a DELETE request.
   * @param path A path to append to the base url.
   * @param configOverrides A config object to merge onto the base config.
   * @protected
   */
  protected async delete<T>(path = '', configOverrides: AxiosRequestConfig): Promise<Result<T | null, ApiErrorBase>> {
    return await this.requestResultWrapper<T>(path, configOverrides, (fullPath, config) => {
      return axios.delete(fullPath, config)
    })
  }

  private async requestResultWrapper<T>(
    subPath: string,
    config: AxiosRequestConfig,
    request: (fullPath: string, config: AxiosRequestConfig | undefined) => Promise<{ data: unknown } | null>
  ): Promise<Result<T | null, ApiErrorBase>> {
    if (subPath.length > 0 && subPath[0] !== '/') {
      subPath = `/${subPath}`
    }
    try {
      const responseData: T | null = ((await request(`${this.urlBase}${subPath}`, config))?.data as T) ?? null
      return ok(responseData)
    } catch (e: unknown) {
      return err(new ApiErrorBase(e))
    }
  }
}
