export class ApiErrorBase {
  responseStatus: number;
  errorMessage: string;

  public constructor(error: unknown) {
    const e = error as {
      response: { data: { success: boolean; error: string }; status: number };
    } | null;
    this.responseStatus = e?.response?.status ?? 0;
    this.errorMessage = e?.response?.data?.error ?? 'Client error';
  }
}
