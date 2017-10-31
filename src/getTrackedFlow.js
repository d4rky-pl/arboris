const getTrack = require('./getTrack')
const { flow } = require('mobx-state-tree')

module.exports = function getTrackedFlow(self) {
  const track = getTrack(self)
  return (fn) => track(flow(fn))
}