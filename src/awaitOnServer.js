const { renderToString } = require('react-dom/server')
const isNode = require('detect-node')

module.exports = function awaitOnServer(fn) {
  let prerenderMethod = (markup) => renderToString(markup)
  let renderMethod = (markup) => renderToString(markup)
  
  const promises = []
  
  const untilReady = async function () {
    const currentLength = promises.length
    await Promise.all(promises)

    if(promises.length > currentLength) {
      return untilReady()
    }

    promises.length = 0
  }
  
  const methods = {
    setPrerenderMethod: (fn) => prerenderMethod = fn,
    setRenderMethod: (fn) => renderMethod = fn,
    
    track(fn) {
      if(isNode) {
        return function() {
          const promise = fn.apply(null, arguments)
          promises.push(promise)
          return promise
        }
      } else {
        return fn
      }
    },
    
    async render(markup) {
      await prerenderMethod(markup)
      await untilReady()
      return await renderMethod(markup)
    }
  }
  
  return fn.call(null, methods)
}