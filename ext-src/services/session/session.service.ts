import { AxiosRequestConfig } from 'axios'
import { ApiServiceBase } from '../base.service'

export interface CreateSessionRequest {
  apiKey: string
  sessionToken?: string
  meta?: {
    supplementaryId?: string
  }
}

export interface CreateSessionResponse {
  session: string
}

export interface GetUserSessionResponse {
  data: any | null
  status: number
}

export interface DeleteUserSessionResponse {
  data: any | null
  status: number
}

class SessionService extends ApiServiceBase {
  /**
   * This creates a session for a user, optionally an API key can be sent in the request body
   * to provision a session for a particular user account,
   * otherwise an anonymous session will be created.
   * If a session token is sent in the Authorization header,
   * it will return the same session token if the session exists,
   * or a new session token if it does not.
   * @param payload An Object with a API Key
   */
  async createUserSession(data: CreateSessionRequest) {
    const config: AxiosRequestConfig = this.getConfig(data.sessionToken)
    const response = await this.post<CreateSessionResponse>('/session', data, config)
    return response
  }

  /**
   *  This will delete the session and all stored user data for that session.
   *  The session will do so automatically within an hour,
   *  but for cleanliness this can be called when a session is about to be terminated or manually by the user.
   * @param sessionToken The Session Token of a user
   */
  async deleteUserSession(sessionToken: string) {
    const config: AxiosRequestConfig = this.getConfig(sessionToken)
    const response = await this.delete<DeleteUserSessionResponse>('/session', config)
    return response
  }

  /**
   *
   * This can be treated as a keepalive for the session if the session token is sent in the authorization header.
   * If no token is sent in the header, this endpoint will return 404.
   * @param sessionToken The Session Token of a user
   */
  async getUserSession(sessionToken: string) {
    const config: AxiosRequestConfig = this.getConfig(sessionToken)
    const response = await this.get<GetUserSessionResponse>('/session', config)
    return response
  }
}

export const sessionService = new SessionService()
