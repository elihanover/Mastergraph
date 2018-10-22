// weave checks if resource exists, and if not, deploys it
const weave = require('../../../WeaveAPI/API')
// console.log(weave)


var db = new weave.Database({
  name: "databae", // ...needs to be same name as variable right now
  key: "testkey",
  key_type: "S"
})

// test function
var test3 = new weave.Lambda({
    name: "hopethis",
    // frequency: "1 minute",
    http: {
      method: 'get',
      path: 'works'
    }
  },
  function(event, context, callback) {
    console.log("Test Passed")
    callback(null, {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
        body: "<p>Hello world!</p>",
    })
  }
)

var test4 = new weave.Lambda({
    name: "thatwould",
    http: {
      method: 'get',
      path: 'becool'
    },
    resources: [db] // TODO: render resources onto lambda template
  },
  function() {
    console.log("Hi there")
    db.put({ // how to get db docclient object?
      'key': 'hi',
      'value': 'there'
    })
  }
)

// TODO: avoid needing to specify filename
// console.log(__filename.replace(__dirname+'/',''))
test3.terraform(__filename.replace(__dirname+'/',''))
test4.terraform(__filename.replace(__dirname+'/',''))
db.terraform()
