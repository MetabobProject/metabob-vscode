//@ts-nocheck
jest.mock('vscode', () => ({
    ...jest.requireActual<Record<string, unknown>>('vscode'),
    workspace: {
        getConfiguration: jest.fn(),
    },
    env: {
        isTelemetryEnabled: true,
        machineId: '123456789',
    },
}));

import * as vscode from 'vscode';
import {
    GetAPIConfig,
    GetAPIBaseURLConfig,
    AnalyzeDocumentOnSaveConfig,
    GetChatGPTToken,
    BackendService,
    GetRequestParamId,
} from './index';


describe('Configuration Functions', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GetAPIConfig', () => {
        it('should return the API key configuration', () => {
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
                get: jest.fn().mockReturnValue('api-key'),
            });
            const apiKey = GetAPIConfig();
            expect(apiKey).toBe('api-key');
        });
    });

    describe('GetAPIBaseURLConfig', () => {
        it('should return the API base URL configuration', () => {
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
                get: jest.fn().mockReturnValue('https://example.com'),
            });
            const baseURL = GetAPIBaseURLConfig();
            expect(baseURL).toBe('https://example.com');
        });
    });

    describe('AnalyzeDocumentOnSaveConfig', () => {
        it('should return the AnalyzeDocumentOnSave configuration', () => {
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
                get: jest.fn().mockReturnValue(true),
            });
            const analyzeOnSave = AnalyzeDocumentOnSaveConfig();
            expect(analyzeOnSave).toBe(true);
        });
    });

    describe('GetChatGPTToken', () => {
        it('should return the ChatGPT token configuration', () => {
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
                get: jest.fn().mockReturnValue('chatgpt-token'),
            });
            const chatGPTToken = GetChatGPTToken();
            expect(chatGPTToken).toBe('chatgpt-token');
        });
    });

    describe('BackendService', () => {
        it('should return the backend service configuration', () => {
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
                get: jest.fn().mockReturnValue('backend-service'),
            });
            const backendService = BackendService();
            expect(backendService).toBe('backend-service');
        });
    });

    describe('GetRequestParamId', () => {
        it('should return the machine ID if telemetry is enabled', () => {
            const requestId = GetRequestParamId();
            expect(requestId).toBe('123456789');
        });
    });
});
