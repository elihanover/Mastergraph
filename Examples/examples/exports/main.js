// weave checks if resource exists, and if not, deploys it
const weave = require('../../../WeaveAPI')
console.log(weave)
console.log("lambda: " + weave.Lambda)
console.log("database: " + weave.Database)
// var db = new Database('kv', { key: "date", value: "reported weather"})

// test function
var test = new weave.Lambda({
    http: "get test"
  },
  function() {
    console.log("Test Passed")
  }
)

console.log(test)
weave.deployLambda(test)
