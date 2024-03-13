// src/__mocks__/vscode.ts

type MessageType = {
    type: string;
    data: any;
};

const postMessageMock = jest.fn();

const vscode = {
    Uri: jest.fn(),
    env: jest.fn(),
    postMessage: postMessageMock,
    getState: jest.fn(),
    setState: jest.fn(),
};

export default vscode;
