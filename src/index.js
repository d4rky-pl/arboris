import { renderToString } from 'react-dom/server'
import Tracker from './tracker'
import createMiddleware from './middleware'

function Arboris({
  maxDepth = 10,
  warnOnMaxDepth = true,
  timeout = 25000,
  logger = console,
  renderMethod = (markup) => renderToString(markup)
} = {}) {
  const tracker = new Tracker(maxDepth, timeout, warnOnMaxDepth, logger)

  return {
    middleware: createMiddleware(tracker, logger),
    render: async (markup) => tracker.wait(() => renderMethod(markup))
  }
}

export default Arboris
