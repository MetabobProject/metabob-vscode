jest.mock('vscode', () => ({
    ...jest.requireActual<Record<string, unknown>>('vscode'),
    workspace: {
        workspaceFolders: [{ uri: { fsPath: '/path/to/workspace' } }],
        getWorkspaceFolder: jest.fn(),
        openTextDocument: jest.fn(),
        getConfiguration: jest.fn()
    },
    window: {
        activeTextEditor: {
            document: {
                fileName: 'test-file.md',
                languageId: 'markdown',
                getText: jest.fn(() => 'Sample text'),
                lineCount: 10,
            },
            setDecorations: jest.fn(),
        },
        showTextDocument: jest.fn(),
        withProgress: jest.fn(),
    },
}));

import { Problem } from './types';
import * as vscode from 'vscode';
import Utils from './utils';



describe('Utils', () => {
    describe('getWorkspacePath', () => {
        it('should return workspace path', () => {
            const workspacePath = Utils.getWorkspacePath();
            expect(workspacePath).toEqual('workspace');
        });
    });

    describe('getResource', () => {
        it('should resolve resource path', () => {
            const resourcePath = Utils.getResource('test/resource/path');
            expect(resourcePath).toEqual('/path/to/workspace/test/resource/path');
        });
    });

    describe('extractMetaDataFromDocument', () => {
        it('should extract metadata from document', () => {
            const document = {
                uri: { fsPath: '/path/to/file.md' },
                getText: jest.fn(() => 'Sample text'),
                languageId: 'markdown',
                lineCount: 10,
            };
            // @ts-ignore
            const metaData = Utils.extractMetaDataFromDocument(document);
            expect(metaData.filePath).toEqual('/path/to/file.md');
            expect(metaData.relativePath).toEqual('file.md');
            expect(metaData.fileContent).toEqual('Sample text');
            expect(metaData.isTextDocument).toEqual(true);
            expect(metaData.languageId).toEqual('markdown');
            expect(metaData.endLine).toEqual(9);
            expect(metaData.fileName).toEqual('file.md');
        });
    });

    describe('withProgress', () => {
        it('should execute task with progress', async () => {
            const task = Promise.resolve('result');
            const progressTitle = 'Task in progress';
            const result = await Utils.withProgress(task, progressTitle);
            expect(result).toEqual('result');
        });
    });

    describe('transformResponseToDecorations', () => {
        it('should transform response to decorations', () => {
            const results: Problem[] = [
                {
                    id: '1',
                    path: 'samplePath',
                    category: 'Logic',
                    summary: 'Logic',
                    description: 'Logic',
                    discarded: false,
                    endorsed: false,
                    severity: 'HIGH',
                    startLine: 1,
                    endLine: 3,
                },
                {
                    id: '2',
                    path: 'samplePath',
                    category: 'Logic',
                    summary: 'Logic',
                    description: 'Logic',
                    discarded: false,
                    endorsed: false,
                    severity: 'HIGH',
                    startLine: 5,
                    endLine: 7,
                },
            ];
            const editor = {
                document: {
                    uri: { fsPath: '/path/to/file.txt' },
                    lineCount: 10,
                },
            };
            const jobId = '12345';
            const transformed = Utils.transformResponseToDecorations(results, editor as any, jobId);
            expect(transformed).toHaveProperty('decorationType');
            expect(transformed).toHaveProperty('decorations');
            expect(transformed.decorations.length).toEqual(2);
        });
    });

    describe('openFileInNewTab', () => {
        it('should open file in new tab', async () => {
            vscode.workspace.openTextDocument = jest.fn().mockResolvedValueOnce({} as any);
            vscode.window.showTextDocument = jest.fn().mockResolvedValueOnce({} as any);
            const filePath = '/path/to/file.txt';
            const result = await Utils.openFileInNewTab(filePath);
            expect(result).toBeDefined();
        });
    });

    describe('getRootFolderName', () => {
        it('should return root folder name', () => {
            (vscode.workspace.workspaceFolders as unknown as jest.Mock).mockReturnValue([
                { name: 'root' } as any,
            ]);
            const rootFolderName = Utils.getRootFolderName();
            expect(rootFolderName).toEqual('root');
        });

        it('should return undefined if no workspace folder', () => {
            (vscode.workspace.workspaceFolders as unknown as jest.Mock).mockReturnValue(undefined);
            const rootFolderName = Utils.getRootFolderName();
            expect(rootFolderName).toBeUndefined();
        });
    });
});
