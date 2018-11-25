# Mastergraph API
## *Visual prototyping and management of cloud applications for hackers*.
### *Mastergraph allows you to define platform agnostic cloud deployments with our intuitive UI, simplified API, or JSON.*

## Installation
```
npm install weaveapi
```



## Weave a cloud app using JS objects.
### 1. Define and configure resources in code
``` node
const weave = require('weaveapi')

// Specify a key/value database
var database = new weave.Database({
  name: "database",
  hashkey: "user"
})

// Lambda function with endpoint: /users/get/{user_id}
var getUser = new weave.Lambda({
    name: "getUser",
    http: {
      method: 'get',
      path: '/userdb/find'
    },
    resources: [database],
  },
  async function() {
    let response = await database.set({
      'user': 'me'      
    }, 'info', {
          'email': 'me@me.com',
          'address': '1 Street Road'
    })
  }
)

```
### 2. `mastergraph filename.js`


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
  hashkey: "username"         // hashkey required
  sortkey: "age"              // sortkey optional
})
```
