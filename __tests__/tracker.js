import Tracker from '../src/tracker'
import { makePromise } from '../src/utils'
import sinon from 'sinon'

const fn = () => {}
const name = Date.now()

const sandbox = sinon.createSandbox()
const newTracker = ({ renderLimit = 10, timeout = 25000, logger = console } = {}) =>
  new Tracker(renderLimit, timeout, true, logger)

describe('tracker.js', () => {
  afterEach(() => sandbox.restore())

  it('adds call to collection', () => {
    const tracker = newTracker()

    tracker.add(fn, name)

    expect(tracker.collection.size).toBe(1)
  })

  it('adds unlabeled call to collection', () => {
    const tracker = newTracker()

    tracker.add(fn)

    expect(tracker.collection.values().next().value).toBe(fn.name)
    expect(tracker.collection.size).toBe(1)
  })

  it('adds unlabeled ananymous function as a call to collection', () => {
    const tracker = newTracker()

    tracker.add(() => {})

    expect(tracker.collection.values().next().value).toBe('() => {}')
    expect(tracker.collection.size).toBe(1)
  })

  it('removes call from collection if there is one', () => {
    const tracker = newTracker()

    tracker.collection.set(fn, name)

    expect(tracker.collection.size).toBe(1)

    tracker.remove(fn)

    expect(tracker.collection.size).toBe(0)
  })

  it('resolves the promise if there is no more calls to remove', () => {
    const tracker = newTracker()
    tracker.promise = makePromise()
    tracker.promise.resolve = sandbox.spy()

    expect(tracker.collection.size).toBe(0)

    tracker.remove(fn)

    expect(tracker.promise.resolve.calledOnce).toBe(true)
  })

  it('checks if call is in collection', () => {
    const tracker = newTracker()
    tracker.collection.set(fn, name)

    expect(tracker.has(fn)).toBe(true)
  })

  it('successfully waits for render loop to finish on first pass', async () => {
    const logger = { error: sandbox.spy() }
    const tracker = newTracker({ logger })
    tracker.add(fn)
    const renderMethod = () => {
      tracker.remove(fn)
      return '<div>success</div>'
    }

    const result = await tracker.wait(renderMethod)

    expect(result).toBe('<div>success</div>')
    expect(tracker.depthLevel).toBe(1)
    expect(logger.error.notCalled).toBe(true)
  })

  it('increases depth limit when there are unfinished flows after render', async () => {
    const logger = { error: sandbox.spy() }
    const tracker = newTracker({ logger })
    tracker.add(fn)
    const renderMethod = () => { setTimeout(() => tracker.remove(fn), 500) }

    await tracker.wait(renderMethod)

    expect(tracker.depthLevel).toBe(2)
    expect(logger.error.notCalled).toBe(true)
  })

  it('stops waiting for render loop when timeout is reached', async () => {
    const logger = { error: sandbox.spy() }
    const tracker = newTracker({ timeout: 500, logger })
    tracker.add(fn)
    const renderMethod = () => { setTimeout(() => tracker.remove(fn), 1000) }

    await tracker.wait(renderMethod)

    expect(logger.error.called).toBe(true)
  })

  it('stops waiting for render loop when render limit is reached', async () => {
    const logger = { warn: sandbox.spy() }
    const tracker = newTracker({ renderLimit: 1, logger })
    tracker.add(fn)
    const renderMethod = () => { setTimeout(() => tracker.remove(fn), 500) }

    await tracker.wait(renderMethod)

    expect(logger.warn.calledOnce).toBe(true)
  })
})