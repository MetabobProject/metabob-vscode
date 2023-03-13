import * as vscode from 'vscode';
import { getAPIConfig } from '../config';
import { sessionService } from '../services/session/session.service';
import { SessionState } from '../store/session.state';
import { CreateSessionRequest } from '../types';

export async function createUserSession(context: vscode.ExtensionContext) {
  const sessionState = new SessionState(context);
  const apiKey = getAPIConfig();
  let payload: CreateSessionRequest = {
    apiKey: apiKey || '123-123-123-123-123',
  };

  const sessionToken = sessionState.get();
  if (sessionToken) {
    payload['sessionToken'] = sessionToken.value;
  }

  const response = await sessionService.createUserSession(payload);
  if (response.isOk()) {
    if (response.value?.session) {
      sessionState.set(response.value?.session);
    }
  }

  if (response.isErr()) {
    if (response.error.response.data.session) {
      sessionState.set(response.error.response.data.session);
    } else {
      return;
    }
  }
}
