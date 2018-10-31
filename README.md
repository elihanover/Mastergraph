# Mastergraph API
## *Prototyping, managing, and testing cloud deployments for hackers*.
### *Mastergraph allows you to define platform agnostic cloud deployments with our intuitive UI, simplified API, or JSON.*

## Weave a cloud app using JS objects.
### 1. Define and configure resources in code
``` node
const weave = require('weaveapi')

// Specify a k/v database
var databae = new weave.Database({
  name: "databae",
  key: "things"
})

// Lambda function with endpoint: /howisthispossible
var my_lambda = new weave.Lambda({
    name: "thatwould",
    http: {
      method: 'get',
      path: 'howisthispossible'
    },
    resources: [databae],
  },
  async function() {
    let res = await databae.put({
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
        "name": "myfunction",
        "http": {
          "method": "get",
          "path": "pathtome"
        },
        "handler": "test.js"
      },
      "resources": ["databae"]
    },
    {
      "type": "database",
      "params": {
        "name": "mydb",
        "key": "ssn"
      }
    }
  ]
}
```

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
    console.log("wow, this actually works.")
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
