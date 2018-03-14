import { renderToString } from "react-dom/server"
import Tracker from "./tracker"
import createMiddleware from "./middleware"

function Arboris({
  renderLimit = 10,
  warnOnMaxLimit = true,
  timeLimit = 25000,
  logger = console,
  renderMethod = markup => renderToString(markup)
} = {}) {
  const tracker = new Tracker({
    renderLimit,
    timeLimit,
    warnOnMaxLimit,
    logger
  })

  return {
    middleware: createMiddleware(tracker, logger),
    render: async markup => tracker.wait(() => renderMethod(markup))
  }
}

export default Arboris
