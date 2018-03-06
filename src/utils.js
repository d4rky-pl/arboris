export function makePromise() {
  let resolve, reject
  const promise = new Promise(function(resolveFn, rejectFn) {
    resolve = resolveFn
    reject = rejectFn
  })
  promise.resolve = resolve
  promise.reject = reject
  return promise
}