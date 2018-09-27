// weave checks if resource exists, and if not, deploys it
const weave = require('../../../WeaveAPI/API')
console.log(weave)
// console.log("lambda: " + weave.Lambda)
// console.log("database: " + weave.Database)
// var db = new Database('kv', { key: "date", value: "reported weather"})

// test function
var test = new weave.Lambda({
    name: "myprecious",
    // frequency: "1 minute",
    http: {
      method: 'get',
      path: 'heythere'
    }
  },
  function() {
    console.log("Test Passed")
  }
)

var test2 = new weave.Lambda({
    name: "schmeeeegle",
    logs: true,
    http: {
      method: 'get',
      path: 'master'
    }
  },
  function() {
    console.log("Hi there")
  }
)

// TODO: avoid needing to specify filename
test.terraform(__filename.replace(__dirname+'/',''))
test2.terraform(__filename.replace(__dirname+'/',''))
