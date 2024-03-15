
// @ts-nocheck
// Mocked Uri interface
export interface Uri {
    scheme: string;
    path: string;
}

// Mocked Position class
export class Position {
    constructor(public line: number, public character: number) { }

    isBefore(other: Position): boolean {
        return this.line < other.line || (this.line === other.line && this.character < other.character);
    }

    // Mocked methods
    isBeforeOrEqual = jest.fn((other: Position) => this.isBefore(other) || this.isEqual(other));
    isAfter = jest.fn((other: Position) => !this.isBeforeOrEqual(other));
    isAfterOrEqual = jest.fn((other: Position) => this.isAfter(other) || this.isEqual(other));
    isEqual = jest.fn((other: Position) => this.line === other.line && this.character === other.character);
    compareTo = jest.fn((other: Position) => {
        if (this.isBefore(other)) return -1;
        if (this.isAfter(other)) return 1;
        return 0;
    });
    translate = jest.fn((lineDelta?: number, characterDelta?: number) => {
        const line = typeof lineDelta === 'number' ? this.line + lineDelta : this.line;
        const character = typeof characterDelta === 'number' ? this.character + characterDelta : this.character;
        return new Position(line, character);
    });
    with = jest.fn((line?: number, character?: number) => new Position(line ?? this.line, character ?? this.character));
}

// Mocked Range class
export class Range {
    constructor(public start: Position, public end: Position) { }

    isEmpty = jest.fn(() => this.start.isEqual(this.end));
    isSingleLine = jest.fn(() => this.start.line === this.end.line);
    contains = jest.fn((positionOrRange: Position | Range) => {
        if (positionOrRange instanceof Position) {
            return (
                (positionOrRange.isAfterOrEqual(this.start) && positionOrRange.isBefore(this.end)) ||
                positionOrRange.isEqual(this.start) ||
                positionOrRange.isEqual(this.end)
            );
        }
        return (
            this.contains(positionOrRange.start) ||
            this.contains(positionOrRange.end) ||
            (positionOrRange.start.isBeforeOrEqual(this.start) && positionOrRange.end.isAfterOrEqual(this.end))
        );
    });
    isEqual = jest.fn((other: Range) => this.start.isEqual(other.start) && this.end.isEqual(other.end));
    intersection = jest.fn((range: Range) => {
        const start = this.start.isBefore(range.start) ? range.start : this.start;
        const end = this.end.isAfter(range.end) ? range.end : this.end;
        return start.isBefore(end) ? new Range(start, end) : undefined;
    });
    union = jest.fn((other: Range) => {
        const start = this.start.isBefore(other.start) ? this.start : other.start;
        const end = this.end.isAfter(other.end) ? this.end : other.end;
        return new Range(start, end);
    });
    with = jest.fn((start?: Position, end?: Position) => new Range(start ?? this.start, end ?? this.end));
}

// Mocked TextDocument interface
export interface TextDocument {
    uri: Uri;
    fileName: string;
    languageId: string;
    version: number;
    isDirty: boolean;
    isClosed: boolean;

    // Implement other properties and methods
}

export class ExtensionContextMock {
    // Add any necessary properties and methods here for your tests
    subscriptions: { dispose: jest.Mock }[] = [];

    // Mock method to subscribe to events
    subscribe(subscription: { dispose: jest.Mock }): void {
        this.subscriptions.push(subscription);
    }

    // Mock method to trigger disposal of subscriptions
    dispose(): void {
        this.subscriptions.forEach(sub => sub.dispose());
        this.subscriptions = [];
    }
}

// Mocked vscode module
const vscode = {
    version: '1.0.0',
    Position,
    Range,
    Uri: { scheme: '', path: '' },
    window: {
        activeTextEditor: {
            document: null as TextDocument | null,
        },
    },
    commands: {
        executeCommand: jest.fn(),
    },
    languages: {
        getTextDocument: jest.fn(),
    },
    env: {
        isTelemetryEnabled: true,
        machineId: '123456789',
    },
};

vscode.ExtensionContext = ExtensionContextMock;

export default vscode;
