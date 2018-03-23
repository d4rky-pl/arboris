const exec = require("child_process").exec
const mstVersions = ["1.2.1", "1.4.0"]

mstVersions.forEach(function(version) {
  exec(
    `cd __tests__/mobx-state-tree/${version} && npm install`,
    (error, stdout, stderr) => {
      console.log(`${stdout}`)
      console.log(`${stderr}`)
      if (error !== null) {
        console.log(`exec error: ${error}`)
      }
    }
  )
})
