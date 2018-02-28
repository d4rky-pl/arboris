import { makePromise } from './utils'

const TIMEOUT = new Error('Tracker timeout')

class Tracker {
  constructor(depthLimit, timeLimit, warnOnMaxDepth, logger) {
    this.collection = new Map()

    this.depthLimit = depthLimit
    this.depthLevel = 1
    this.timeLimit = timeLimit
    this.warnOnMaxDepth = warnOnMaxDepth
    this.logger = logger
  }
  
  add(obj, label) {
    if(typeof label === 'undefined') {
      if(typeof obj.name !== 'undefined' && obj.name !== "") {
        label = obj.name
      } else {
        label = obj.toString()
      }
    }
    
    this.collection.set(obj, label)
  }
  
  remove(obj) {
    this.collection.delete(obj)
    if(this.collection.size === 0 && this.promise) {
      this.promise.resolve()
    }
  }
  
  has(obj) {
    return this.collection.has(obj)
  }
  
  depthLimitReached() {
    return this.depthLevel >= this.depthLimit
  }
  
  unfinished() {
    return this.collection.values()
  }
  
  async wait(renderMethod) {
    let timeLeft = this.timeLimit
    let currentTime = Date.now()
    let result
    
    try {
      while(!this.depthLimitReached()) {
        this.promise = makePromise()
        let timeout = setTimeout(() => this.promise.reject(TIMEOUT), timeLeft)
  
        result = renderMethod()

        if(this.collection.size > 0) {
          await this.promise

          clearTimeout(timeout)
          timeLeft = timeLeft - Math.round((currentTime - Date.now()) / 1000)

          if(timeLeft > 0) {
            timeout = setTimeout(() => this.promise.reject(TIMEOUT), timeLeft)
            currentTime = Date.now()
            this.depthLevel += 1
          } else {
            throw TIMEOUT
          }
        } else {
          break
        }
      }
      if(this.warnOnMaxDepth && this.depthLimitReached()) {
        this.logger.warn(
          "[arboris] Depth limit has been hit on this request and yet there are still unfinished flows and methods.\n" +
          "Double-check if you're not falling into an infinite loop.\n\n" +
          "Unfinished flows and methods:\n" + Array.from(this.unfinished()).join("\n")
        )
      }
    } catch(e) {
      if(e === TIMEOUT) {
        this.logger.error(
          "[arboris] Asynchronous methods have not finished in " + this.timeLimit + "ms.\n" +
          "Make sure that all Promises and flows are resolved to prevent memory leaks.\n\n" +
          "Unfinished flows and methods:\n" + Array.from(this.unfinished()).join("\n")
        )
      } else {
        this.logger.error(
          "[arboris] Your store has thrown an uncaught exception.\n" +
          "Make sure you're catching and handling all exceptions properly."
        )
        throw e
      }
    }
    
    return result
  }
}

Tracker.TIMEOUT = TIMEOUT
export default Tracker


//
//batch: (renderMethod, depthLimit, timeLimit) {
//  const promise = makePromise()
//  setTimeout(() => promise.reject(TIMEOUT), timeLimit)
//  let depth = 0;
//  let result;
//
//  try {
//    while(depth < depthLimit) {
//      startTracking(promise)
//      result = renderMethod()
//      if(anythingToTrack) {
//        await endTracking()
//      } else {
//        break;
//      }
//    }
//  } catch(TIMEOUT) {
//    console.log()
//  }
//  if(depth === depthLimit && warnOnDepthLimit) {
//    console.log('depth limit hit')
//  }
//  return result
//}
//
//
