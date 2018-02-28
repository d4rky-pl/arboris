export default function createMiddleware(tracker, logger) {
  return function (call, next) {
    console.log(call)
    if(call.type === 'flow_spawn') {
      tracker.add(call.id, call.name)
    }

    if(call.type === 'flow_return' || call.type === 'flow_throw') {
      if(!tracker.has(call.id)) {
        logger.error(
          "[arboris] Could not find flow " + call.name + " (" + call.type + ").\n" +
          "Make sure you're applying Arboris middleware before running any actions."
        )
      } else {
        tracker.remove(call.id)
      }
    }

    if(call.type === 'action' || !tracker.depthLimitReached()) {
      return next(call);
    }
  }
}