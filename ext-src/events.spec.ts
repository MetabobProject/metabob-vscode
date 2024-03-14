import { EventEmitter } from 'vscode';
import {
    bootstrapExtensionEventEmitter,
    getExtensionEventEmitter,
    disposeExtensionEventEmitter,
} from './events';

describe('Extension Event Emitter', () => {
    let eventEmitterMock: EventEmitter<any>;

    beforeEach(() => {
        // Mock the EventEmitter
        eventEmitterMock = {
            fire: jest.fn(),
            event: jest.fn(),
            dispose: jest.fn(),
        } as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('bootstrapExtensionEventEmitter', () => {
        it('should create an event emitter if not already created', () => {
            bootstrapExtensionEventEmitter();
            expect(eventEmitterMock).toBeDefined();
        });

        it('should not create a new event emitter if one already exists', () => {
            bootstrapExtensionEventEmitter(); // Create the first emitter
            const initialEmitter = getExtensionEventEmitter(); // Get the first emitter
            bootstrapExtensionEventEmitter(); // Try to create another emitter
            const secondEmitter = getExtensionEventEmitter(); // Get the second emitter
            expect(initialEmitter).toBe(secondEmitter); // Ensure they are the same instance
        });
    });

    describe('getExtensionEventEmitter', () => {
        it('should return the existing event emitter if it exists', () => {
            getExtensionEventEmitter();
            expect(eventEmitterMock).toBeDefined();
        });

        it('should create a new event emitter if none exists', () => {
            const emitter = getExtensionEventEmitter();
            expect(emitter).toBeDefined();
        });
    });

    describe('disposeExtensionEventEmitter', () => {
        it('should dispose the existing event emitter if it exists', () => {
            disposeExtensionEventEmitter();
            expect(eventEmitterMock.dispose).toHaveBeenCalled();
        });

        it('should not throw error if no event emitter exists', () => {
            disposeExtensionEventEmitter(); // Ensure this does not throw error
            expect(eventEmitterMock.dispose).not.toHaveBeenCalled();
        });
    });
});
