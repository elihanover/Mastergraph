# Mastergraph API
### Prototyping, managing, and testing cloud deployments for hackers.

## Weave a cloud app.
### 1. Define and configure resources in code
``` node
const weave = require('weaveapi')

// Define a k/v database
var databae = new weave.Database({
  name: "databae",
  key: "things"
})

// Lambda function with endpoint: /becool
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

// Lambda function with endpoint: /works
var hopethis = new weave.Lambda({
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

```
### 2. `weave deploy filename.js`
### 3. Yea, that's it.

## Resources
#### Lambda Functions
``` node
from weave import Lambda
var test = new Lambda({
    http: "get test",         // http request path
    frequency: "1m",          // cron job frequency
    resources: [db, myqueue]  // dependent resources callable within lambda
  },
  function() {                // actual function logic
    console.log("wow, this actually works.")
  }
)
```
#### (Key-Value) Database
``` node
var my_db = new Database({
  name: "my_db",
  key: "username"
})

```
