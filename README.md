# Mastergraph API
## *Visual prototyping and management of cloud applications for hackers*.
### *Mastergraph allows you to define platform agnostic cloud deployments with our intuitive UI, simplified API, or JSON.*

## Weave a cloud app using JS objects.
### 1. Define and configure resources in code
``` node
const weave = require('weaveapi')

// Specify a key/value database
var database = new weave.Database({
  name: "database",
  key: "users"
})

// Lambda function with endpoint: /users/get/{user_id}
var getUser = new weave.Lambda({
    name: "getUser",
    http: {
      method: 'get',
      path: 'users/get/{user_id}'
    },
    resources: [database],
  },
  async function() {
    let response = await database.put({
      'key': 'hi',
      'value': 'there' // value can be any dict
    })
    console.log("result: " + res)
  }
)

```
### 2. `weave filename.js`

## Weave a cloud app using a JSON file.
``` json
{
  "resources": [
    {
      "type": "function",
      "params": {
        "name": "useTheForce",
        "http": {
          "method": "get",
          "path": "/padawans/luke"
        },
        "handler": "rebelDataHandler.js"
      },
      "resources": ["database"]
    },
    {
      "type": "database",
      "params": {
        "name": "jedi",
        "key": "mitochlorians"
      }
    }
  ]
}
```
### `weave filename.json`

## Resources
### Lambda Functions
``` node
from weave import Lambda
var lambda = new weave.Lambda({
    http: "get test",         // http request path
    frequency: "1m",          // cron job frequency
    resources: [db, myqueue]  // dependent resources callable within lambda
  },
  function() {                // actual function logic
    console.log("Wow, this actually works.")
  }
)
```
### (Key-Value) Database
``` node
from weave import Database
var my_db = new Database({
  name: "my_db",
  key: "username"
})
```
