import sinon from 'sinon'
import { types, addMiddleware, flow } from 'mobx-state-tree'
import createMiddleware from '../src/middleware'
import track from '../src/track'

const mockAction = (opts) => Object.assign({ id: Date.now(), name: Date.now(), type: 'action' }, opts)
const mockAsyncAction = (opts) => {
  const name = Date.now()
  return mockAction(Object.assign({ name, context: { $arboris: { [name]: { type: 'async' } } } }, opts))
}

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
  
  describe('middleware function', () => {
   it('adds id and name to tracker for flow_span action', () => {
     const tracker = { add: sandbox.spy(), renderLimitReached: falseFn }
     const middleware = createMiddleware(tracker, console)
     const action = mockAction({ type: 'flow_spawn' })

     middleware(action, noop)
     expect(tracker.add.calledWith(action.id, action.name)).toBe(true)
   })

   it('removes flow from tracker when it is over', () => {
     const tracker = {
       has: trueFn,
       remove: sandbox.spy(),
       renderLimitReached: falseFn
     }
     const middleware = createMiddleware(tracker, console)
     const action = mockAction({ type: 'flow_return' })

     middleware(action, noop)
     expect(tracker.remove.calledWith(action.id)).toBe(true)
   })

   it('removes flow from tracker when it fails', () => {
     const tracker = {
       has: trueFn,
       remove: sandbox.spy(),
       renderLimitReached: falseFn
     }
     const middleware = createMiddleware(tracker, console)
     const action = mockAction({ type: 'flow_throw' })

     middleware(action, noop)
     expect(tracker.remove.calledWith(action.id)).toBe(true)
   })

   it('sends error to the logger if flow is missing from tracker', () => {
     const tracker = {
       has: falseFn,
       renderLimitReached: falseFn
     }
     const logger = { error: sandbox.spy() }

     const middleware = createMiddleware(tracker, logger)
     const action = mockAction({ type: 'flow_return' })

     middleware(action, noop)
     expect(logger.error.calledOnce).toBe(true)
   })

   it('calls next function if render limit has not been reached', () => {
     const tracker = {
       has: trueFn,
       add: noop,
       renderLimitReached: falseFn
     }
     const next = sandbox.spy()

     const middleware = createMiddleware(tracker, console)
     const action = mockAsyncAction()

     middleware(action, next)
     expect(next.calledOnce).toBe(true)
   })

   it('does not call next function if render limit has been reached', () => {
     const tracker = {
       has: trueFn,
       add: noop,
       renderLimitReached: trueFn
     }
     const next = sandbox.spy()

     const middleware = createMiddleware(tracker, console)
     const action = mockAsyncAction()

     middleware(action, next)
     expect(next.notCalled).toBe(true)
   })

   it('does not block non-flow functions if render limit has been reached', () => {
     const tracker = {
       has: trueFn,
       renderLimitReached: trueFn
     }
     const next = sandbox.spy()

     const middleware = createMiddleware(tracker, console)
     const action = mockAction({ type: 'action' })

     middleware(action, next)
     expect(next.calledOnce).toBe(true)
   })
  })
  
  it('within MST instance', async () => {
    const delay = sandbox.stub().resolves(true)
    const Store = track(
      types.model('Store')
        .actions(() => ({
          exampleFlow: flow(function* () {
            yield delay()
            return 2
          })
        })),
      { exampleFlow: track.async() }
    )

    const store = Store.create()
  
    const tracker = {
      add: sandbox.spy(),
      has: trueFn,
      remove: sandbox.spy(),
      renderLimitReached: falseFn
    }
  
    const middleware = createMiddleware(tracker, console)
  
    addMiddleware(store, middleware)
    
    const foo = await store.exampleFlow()
    expect(foo).toBe(2)
  })
})