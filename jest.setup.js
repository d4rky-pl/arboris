const execSync = require("child_process").execSync
const mstVersions = ["1.2.1", "1.3.1", "1.4.0", "2.0.1"]

mstVersions.forEach(function(version) {
  execSync(
    `cd __tests__/mobx-state-tree/${version} && npm install --silent`,
    error => {
      if (error !== null) {
        console.log(`exec error: ${error}`)
      }
    }
  )
})
