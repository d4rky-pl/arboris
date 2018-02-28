import sinon from 'sinon'
import { types, addMiddleware, flow } from 'mobx-state-tree'
import createMiddleware from '../src/middleware'

const mockAction = (opts) => Object.assign({ id: Date.now(), name: Date.now() }, opts)
const noop = () => {}
const falseFn = () => false
const trueFn = () => true

let sandbox = sinon.createSandbox()

describe('middleware.js', () => {
  afterEach(() => sandbox.restore())

  it('creates a function', () => {
    const middleware = createMiddleware()
    expect(middleware).toBeInstanceOf(Function)
  })
  
  //describe('middleware function', () => {
  //  it('adds id and name to tracker for flow_span action', () => {
  //    const tracker = { add: sandbox.spy(), depthLimitReached: () => false }
  //    const middleware = createMiddleware(tracker, console)
  //    const action = mockAction({ type: 'flow_spawn' })
  //
  //    middleware(action, noop)
  //    expect(tracker.add.calledWith(action.id, action.name)).toBe(true)
  //  })
  //
  //  it('removes flow from tracker when it\' over', () => {
  //    const tracker = {
  //      has: trueFn,
  //      remove: sandbox.spy(),
  //      depthLimitReached: falseFn
  //    }
  //    const middleware = createMiddleware(tracker, console)
  //    const action = mockAction({ type: 'flow_return' })
  //
  //    middleware(action, noop)
  //    expect(tracker.remove.calledWith(action.id)).toBe(true)
  //  })
  //
  //  it('removes flow from tracker when it fails', () => {
  //    const tracker = {
  //      has: trueFn,
  //      remove: sandbox.spy(),
  //      depthLimitReached: falseFn
  //    }
  //    const middleware = createMiddleware(tracker, console)
  //    const action = mockAction({ type: 'flow_throw' })
  //
  //    middleware(action, noop)
  //    expect(tracker.remove.calledWith(action.id)).toBe(true)
  //  })
  //
  //  it('sends error to the logger if flow is missing from tracker', () => {
  //    const tracker = {
  //      has: falseFn,
  //      depthLimitReached: falseFn
  //    }
  //    const logger = { error: sandbox.spy() }
  //
  //    const middleware = createMiddleware(tracker, logger)
  //    const action = mockAction({ type: 'flow_return' })
  //
  //    middleware(action, noop)
  //    expect(logger.error.calledOnce).toBe(true)
  //  })
  //
  //  it('calls next function if depth limit has not been reached', () => {
  //
  //  })
  //
  //  it('does not call next function if depth limit has been reached', () => {
  //
  //  })
  //
  //  it('does not block non-flow functions if depth limit has been reached', () => {
  //
  //  })
  //})
  
  it('within MST instance', async () => {
    debugger;
    const delay = sandbox.stub().resolves(true)
    const Store = types.model('Store')
      .actions(self => ({
        exampleFlow: flow(function* (args) {
          yield delay()
          return 2
        })
      }))
    const store = Store.create()
  
    const tracker = {
      add: sandbox.spy(),
      has: trueFn,
      remove: sandbox.spy(),
      depthLimitReached: falseFn
    }
  
    const middleware = createMiddleware(tracker, console)
  
    addMiddleware(store, middleware)
    
    const foo = await store.exampleFlow()
    console.log(foo)
    expect(foo).toBe(2)
  })
})

//
//export default function createMiddleware(tracker) {
//  return function (call, next) {
//    if(call.type === 'flow_spawn') {
//      tracker.add(call.id, call.name)
//    }
//
//    if(call.type === 'flow_return' || call.type === 'flow_throw') {
//      if(!tracker.has(call.id)) {
//        console.error(
//          "[arboris] Could not find flow " + call.name + " (" + call.type + ").\n" +
//          "Make sure you're applying Arboris middleware before running any actions."
//        )
//      } else {
//        tracker.remove(call.id)
//      }
//    }
//
//    if(!tracker.depthLimitReached()) {
//      return next(call);
//    }
//  }
//}