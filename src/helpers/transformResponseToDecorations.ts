import { Result } from 'rusty-result-ts';
import { ApiErrorBase } from '../services/base.error';
import { SubmitRepresentationResponse } from '../types';
import { GenerateDecorations } from './generateDecorations';

export function transformResponseToDecorations(
  response: Result<SubmitRepresentationResponse | null, ApiErrorBase>
) {
  if (response.isOk()) {
    if (response.value?.results) {
      const decor = GenerateDecorations(response.value.results);
      return decor;
    }
  }
  return undefined;
}
