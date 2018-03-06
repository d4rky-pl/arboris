import {makePromise} from '../src/utils'

describe('makePromise', () => {
  it('returns a promise with accessible resolve function', () => {
    const promise = makePromise()

    expect(promise).toBeInstanceOf(Promise)
    expect(promise.resolve).toBeInstanceOf(Function)
  })

  it('returns a promise with accessible reject function', () => {
    const promise = makePromise()

    expect(promise).toBeInstanceOf(Promise)
    expect(promise.reject).toBeInstanceOf(Function)
  })
})