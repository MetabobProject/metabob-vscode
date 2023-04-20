import { CreateSessionRequest, CreateSessionResponse, getUserSessionResponse } from '../../types'
import { ApiServiceBase } from '../base.service'

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
  async createUserSession(payload: CreateSessionRequest) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (payload.sessionToken) {
      headers['Authorization'] = `Bearer ${payload.sessionToken}`
    }
    const response = await this.post<CreateSessionResponse>('/session', payload, headers)

    return response
  }

  /**
   *  This will delete the session and all stored user data for that session.
   *  The session will do so automatically within an hour,
   *  but for cleanliness this can be called when a session is about to be terminated or manually by the user.
   * @param sessionToken The Session Token of a user
   */
  async deleteUserSession(sessionToken: string) {
    const response = await this.delete('/session', {
      headers: {
        Authorization: `Bearer ${sessionToken}`
      }
    })

    return response
  }

  /**
   *
   * This can be treated as a keepalive for the session if the session token is sent in the authorization header.
   * If no token is sent in the header, this endpoint will return 404.
   * @param sessionToken The Session Token of a user
   */
  async getUserSession(sessionToken: string) {
    const response = await this.get<getUserSessionResponse>('/session', {
      headers: {
        Authorization: `Bearer ${sessionToken}`
      }
    })

    return response
  }
}

export const sessionService = new SessionService()
