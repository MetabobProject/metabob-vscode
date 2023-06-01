import * as vscode from 'vscode'
import { getAPIConfig, getRequestParamId } from '../config'
import { sessionService } from '../services/session/session.service'
import { SessionState } from '../store/session.state'
import { CreateSessionRequest } from '../types'

export async function createOrUpdateUserSession(context: vscode.ExtensionContext): Promise<undefined> {
  const sessionState = new SessionState(context)
  const apiKey = getAPIConfig()
  const requestParamId = getRequestParamId()
  const payload: CreateSessionRequest = {
    apiKey: apiKey || '',
    meta: {
      supplementaryId: requestParamId
    }
  }
  const sessionToken = sessionState.get()
  if (sessionToken) {
    payload['sessionToken'] = sessionToken.value
  }

  const response = await sessionService.createUserSession(payload)

  if (response.isOk()) {
    if (response.value?.session) {
      sessionState.set(response.value?.session)
    }
  }

  if (response.isErr()) {
    if (response.error.response?.data.session ?? undefined) {
      sessionState.set(response.error.response.data.session)
    } else {
      return
    }
  }

  return
}

export async function deleteUserSession(context: vscode.ExtensionContext): Promise<undefined> {
  const sessionState = new SessionState(context)

  const sessionToken = sessionState.get()

  if (sessionToken?.value !== undefined) {
    const response = await sessionService.deleteUserSession(sessionToken?.value)
    if (response.isErr()) {
      // TODO: Check cases
    }
  }
  sessionState.clear()

  return

}