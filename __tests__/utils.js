import {makePromise} from '../src/utils'

describe('makePromise', () => {
  describe('resolve', () => {
    it('returns a promise with accessible resolve function', () => {
      const promise = makePromise()

      expect(promise).toBeInstanceOf(Promise)
      expect(promise.resolve).toBeInstanceOf(Function)
    })

    it('resolves a promise', done => {
      const promise = makePromise()
      promise.then(value => {
        expect(value).toEqual(123)
        done()
      })

      promise.resolve(123)
    })
  })

  describe('reject', () => {
    it('returns a promise with accessible reject function', () => {
      const promise = makePromise()

      expect(promise).toBeInstanceOf(Promise)
      expect(promise.reject).toBeInstanceOf(Function)
    })

    it('rejects a promise', done => {
      const promise = makePromise()
      promise.then(null, value => {
        expect(value).toEqual(123)
        done()
      })

      promise.reject(123)
    })
  })
})