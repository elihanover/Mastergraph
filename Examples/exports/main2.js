
// weave checks if resource exists, and if not, deploys it
const weave = require('../../../WeaveAPI/API')
// const weave = require('weaveapi')
var databae = new weave.Database({
  name: "databae", // ...needs to be same name as variable right now
  key: "things"
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
    resources: [databae]
  },
  async function() {
    console.log("Hi there")
    console.log(databae)
    console.log(databae.put)

    // TODO: AWAIT???
    await databae.put({ // how to get db docclient object?
      'key': 'hi',
      'value': 'there'
    })
    // databae.put({ // how to get db docclient object?
    //   'key': 'hi',
    //   'value': 'there'
    // }).promise()
    console.log("wellhello")
  }
)








// TODO: avoid needing to specify filename
// console.log(__filename.replace(__dirname+'/',''))
test3.terraform(__filename.replace(__dirname+'/',''))
test4.terraform(__filename.replace(__dirname+'/',''))
databae.terraform()
