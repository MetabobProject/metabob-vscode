import * as vscode from 'vscode';
import { GetAPIConfig, GetRequestParamId } from '../config';
import { sessionService, CreateSessionRequest } from '../services';
import { Session } from '../state';

export async function createOrUpdateUserSession(
  context: vscode.ExtensionContext,
): Promise<undefined> {
  const sessionState = new Session(context);
  const apiKey = GetAPIConfig();
  const requestParamId = GetRequestParamId();
  const payload: CreateSessionRequest = {
    apiKey: apiKey || '',
    meta: {
      supplementaryId: requestParamId,
    },
  };

  const sessionToken = sessionState.get()?.value;

  const one_minute = 60_000;

  // Periodically checking the session
  setInterval(() => {
    sessionService
      .getUserSession(sessionToken || '')
      .then(response => {
        if (response.isOk()) {
          // @ts-ignore
          const status = response.value?.httpConfig?.status;
          if (status === 200) {
            return;
          } else if (status === 404) {
            sessionService.createUserSession(payload).then(response => {
              if (response.isOk()) {
                if (response.value?.session) {
                  sessionState.set(response.value?.session);
                }
              }
            });
          }
        }
      })
      .catch(() => {
        return;
      });
  }, one_minute);

  if (sessionToken) {
    payload['sessionToken'] = sessionToken;
  }

  const response = await sessionService.createUserSession(payload);

  if (response.isOk()) {
    if (response.value?.session) {
      sessionState.set(response.value?.session);
    }
  }

  if (response.isErr()) {
    if (response.error.response?.data.session ?? undefined) {
      sessionState.set(response.error.response.data.session);
    } else {
      return;
    }
  }

  return;
}

export async function deleteUserSession(context: vscode.ExtensionContext): Promise<undefined> {
  const sessionState = new Session(context);
  const sessionToken = sessionState.get()?.value;
  if (!sessionToken) return undefined;
  const response = await sessionService.deleteUserSession(sessionToken);
  if (response.isErr()) {
    // TODO: Check cases
  }
  sessionState.clear();

  return;
}
