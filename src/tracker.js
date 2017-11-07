import { makePromise } from './utils'

class Tracker {
  constructor() {
    this.collection = new Map()
    this.promise = makePromise()
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
    if(this.collection.size === 0) {
      this.promise.resolve()
    }
  }
  
  has(obj) {
    return this.collection.has(obj)
  }
  
  unfinished() {
    return this.collection.values()
  }
  
  async wait(maxTimeout = 25000) {
    const timeout = setTimeout(() => {
      this.promise.reject(Tracker.TIMEOUT)
    }, maxTimeout)
    this.promise.then(() => clearTimeout(timeout))
    
    return this.promise
  }
}

Tracker.TIMEOUT = 'tracker.timeout'
export default Tracker