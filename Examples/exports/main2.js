
// weave checks if resource exists, and if not, deploys it
const weave = require('../../../WeaveAPI/API')
// const weave = require('weaveapi')
var databae = new weave.Database({
  name: "databae", // ...needs to be same name as variable right now
  key: "things"
})



var thatwould = new weave.Lambda({
    name: "thatwould",
    http: {
      method: 'get',
      path: 'becool'
    },
    resources: [databae],
  },
  async function() {
    console.log("wellhello")
    let res = await databae.put({ // how to get db docclient object?
      'key': 'hi',
      'value': 'there'
    })
    console.log("res: " + res)
  }
)

// test function
var test3 = new weave.Lambda({
    name: "hopethis",
    // frequency: "1 minute",
    http: {
      method: 'get',
      path: 'works'
    },
    resources: [thatwould],
  },
  async function(event, context, callback) {
    console.log("Test Passed")
    thatwould.trigger();
    callback(null, {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
        body: "<p>Hello world!</p>",
    })
    console.log("here")
  }
)
