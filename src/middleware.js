const getArborisOpts = call =>
  (call.context && call.context.$arboris && call.context.$arboris[call.name]) ||
  null

export default function createMiddleware(tracker, logger) {
  return function(call, next, abort) {
    const opts = getArborisOpts(call)

    if (opts && opts.type === "async" && tracker.renderLimitReached()) {
      return typeof abort === "function" ? abort(null) : null
    }

    if (call.type === "flow_spawn") {
      tracker.add(call.id, call.name)
    }

    if (call.type === "flow_return" || call.type === "flow_throw") {
      if (!tracker.has(call.id)) {
        logger.error(
          "[arboris] Could not find flow " +
            call.name +
            " (" +
            call.type +
            ").\n" +
            "Make sure you're applying Arboris middleware before running any actions."
        )
        return typeof abort === "function" ? abort(null) : null
      } else {
        tracker.remove(call.id)
      }
    }

    return next(call)
  }
}
