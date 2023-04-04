class Queue {
  private readonly queue: any[]
  private start: number
  private end: number

  constructor(array: any[] = []) {
    this.queue = array

    // pointers
    this.start = 0
    this.end = array.length
  }

  isEmpty() {
    return this.end === this.start
  }

  dequeue() {
    if (this.isEmpty()) {
      throw new Error('Queue is empty.')
    } else {
      return this.queue[this.start++]
    }
  }

  enqueue(value: any) {
    this.queue.push(value)
    this.end += 1
  }

  toString() {
    return `Queue (${this.end - this.start})`
  }

  [Symbol.iterator]() {
    let index = this.start

    return {
      next: () =>
        index < this.end
          ? {
              value: this.queue[index++]
            }
          : { done: true }
    }
  }
}

let queue: null | Queue = null
if (!queue) {
  queue = new Queue()
}

export { queue }
