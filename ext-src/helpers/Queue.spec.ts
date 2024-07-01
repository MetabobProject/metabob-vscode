// Import the Queue class
import { Queue } from './Queue';

describe('Queue', () => {
  // Test case for creating an empty queue
  it('creates an empty queue', () => {
    const queue = new Queue();
    expect(queue.isEmpty()).toBe(true);
  });

  // Test case for enqueueing and dequeueing elements
  it('enqueues and dequeues elements', () => {
    const queue = new Queue();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);

    expect(queue.isEmpty()).toBe(false);
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
    expect(queue.isEmpty()).toBe(true);
  });

  // Test case for checking toString method
  it('returns correct string representation', () => {
    const queue = new Queue();
    queue.enqueue(1);
    queue.enqueue(2);

    expect(queue.toString()).toBe('Queue (2)');
  });

  // Test case for iterating over the queue
  it('iterates over the queue', () => {
    const queue = new Queue();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);

    const values = [];
    for (const item of queue) {
      // @ts-ignore
      values.push(item);
    }

    expect(values).toEqual([1, 2, 3]);
  });

  // Test case for dequeueing from an empty queue
  it('throws error when dequeueing from empty queue', () => {
    const queue = new Queue();
    expect(() => queue.dequeue()).toThrow('Queue is empty.');
  });
});
