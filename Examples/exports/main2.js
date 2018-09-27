// weave checks if resource exists, and if not, deploys it
const weave = require('../../../WeaveAPI/API')
console.log(weave)
// console.log("lambda: " + weave.Lambda)
// console.log("database: " + weave.Database)
// var db = new Database('kv', { key: "date", value: "reported weather"})

// test function
var test3 = new weave.Lambda({
    name: "hopethis",
    // frequency: "1 minute",
    http: {
      method: 'get',
      path: 'works'
    }
  },
  function() {
    console.log("Test Passed")
  }
)

var test4 = new weave.Lambda({
    name: "thatwould",
    logs: true,
    http: {
      method: 'get',
      path: 'becool'
    }
  },
  function() {
    console.log("Hi there")
  }
)

// TODO: avoid needing to specify filename
test3.terraform(__filename.replace(__dirname+'/',''))
test4.terraform(__filename.replace(__dirname+'/',''))
