// @ts-nocheck
import { Event } from 'vscode';

// Create a mock class for EventEmitter
export class MockEventEmitter<T> {
    // Define event property
    event: Event<T>;

    // Mocked implementation of fire method
    fire: jest.Mock<void, [data: T]>;

    // Mocked implementation of dispose method
    dispose: jest.Mock<void, []>;

    // Constructor to initialize the mock methods
    constructor() {
        // Mock the fire method
        this.fire = jest.fn();

        // Mock the dispose method
        this.dispose = jest.fn();
    }
}


jest.mock('vscode', () => ({
    ...jest.requireActual<Record<string, unknown>>('vscode'),
    workspace: {
        getConfiguration: jest.fn(),
    },
    EventEmitter: MockEventEmitter,
    env: {
        get isTelemetryEnabled() {
            return true
        },
        machineId: '123456789',
    },
}));

import {
    bootstrapExtensionEventEmitter,
    getExtensionEventEmitter,
    disposeExtensionEventEmitter,
} from './events';

describe('Extension Event Emitter', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('bootstrapExtensionEventEmitter', () => {
        it('should create an event emitter if not already created', () => {
            bootstrapExtensionEventEmitter();
            expect(getExtensionEventEmitter()).toBeDefined();
        });

        it('should not create a new event emitter if one already exists', () => {
            bootstrapExtensionEventEmitter();
            const initialEmitter = getExtensionEventEmitter();
            bootstrapExtensionEventEmitter();
            const secondEmitter = getExtensionEventEmitter();
            expect(initialEmitter).toBe(secondEmitter);
        });
    });

    describe('getExtensionEventEmitter', () => {
        it('should return the existing event emitter if it exists', () => {
            const eventEmitterMock = getExtensionEventEmitter();
            expect(eventEmitterMock).toBeDefined();
        });

        it('should create a new event emitter if none exists', () => {
            const emitter = getExtensionEventEmitter();
            expect(emitter).toBeDefined();
            disposeExtensionEventEmitter();
            expect(emitter).toBeDefined();
        });
    });
});
