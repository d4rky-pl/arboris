const { getEnv } = require('mobx-state-tree')

module.exports = function getTrack(self) {
  const noop = fn => fn
  const env = getEnv(self)
  
  return (env && env.track) || noop
}