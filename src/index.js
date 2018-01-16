import { renderToString } from 'react-dom/server'
import Tracker from './tracker'

export default function () {
  const tracker = new Tracker()
  
  let prerenderMethod = (markup) => renderToString(markup)
  let renderMethod    = (markup) => renderToString(markup)
  
  return {
    setPrerenderMethod(fn) {
      prerenderMethod = fn
    },
    
    setRenderMethod(fn) {
      renderMethod = fn
    },
    
    middleware(call, next) {
      if(call.type === 'flow_spawn') {
        tracker.add(call.id, call.name)
      }
      if(call.type === 'flow_return' || call.type === 'flow_throw') {
        if(!tracker.has(call.id)) {
          console.error(
            "[arboris] Could not find flow  " + call.name + " (" + call.type + ").\n" +
            "Make sure you're applying Arboris middleware before running any actions."
          )
        } else {
          tracker.remove(call.id)
        }
      }
      return next(call);
    },
    
    async track(fn) {
      return async function(...args) {
        try {
          tracker.add(fn)
          return await fn(...args)
        } catch(e) {
          throw e
        } finally {
          tracker.remove(fn)
        }
      }
    },
    
    async render(markup, { timeout = 25000 } = {}) {
      let prerender
      try {
        prerender = await prerenderMethod(markup)
        await tracker.wait(timeout)
        return await renderMethod(markup)
      } catch(e) {
        if(e === Tracker.TIMEOUT) {
          console.error(
            "[arboris] Asynchronous methods have not finished in " + timeout + "ms.\n" +
            "Make sure that all Promises and flows are resolved to prevent memory leaks.\n\n" +
            "Unfinished flows and methods:\n" + Array.from(tracker.unfinished()).join("\n")
          )

          return prerender
        } else {
          console.error(
            "[arboris] Your store has thrown an uncaught exception.\n" +
            "Make sure you're catching and handling all exceptions properly."
          )
          throw e
        }
      }
    }
  };
};
