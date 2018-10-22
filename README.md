# Weave API

## Version 0 To-Do:
#### Lambda:
- api-gateway path parameters (pushing to next version)
- api-gateway hierarchical paths (pushing to later)
- logs for lambda (done)
- infer function handler file more elegantly (syke)
- Lambda as an object, callable (NEXT)
#### DB:
- uh, everything (done)
- DB api (NEXT)
#### General
- cli deploy elegance
	- call terraform apply within `weave deploy -p aws`
	- collect exported resources elegantly
- package resources into groups?
	


## Weave a cloud app.
### 1. Define and configure resources in code
``` node
from weave import Lambda, Database

// (1) define key-value db resource
var db = new Database(type = 'kv', key = "date")

// (2) define lambda that writes to db
var enter = new Lambda({
    http: "get pread",
	resources: db
  },
  function(weather, reporter) {
    db.put({
      key: "08.31.2018",
      value: {
        "weather": weather,
        "reporter": reporter
      }
    })
  })

// (3) define another lambda to read from db
var pread = new Lambda({
  frequency: 1, // for cron job
	resources: db
},
  function() {
    console.log(db.scan())
  }
)
```
### 2. `weave deploy`
### 3. Yea, that's it.

### Resources
#### Lambda Functions
``` node
from weave import Lambda
var test = new Lambda({
    http: "get test",         // http request path
    frequency: "1m",          // cron job frequency
    resources: [db, myqueue]  // dependent resources callable within lambda
  },
  function() {                // actual function logic
    console.log("Test b0iii")
  }
)
```
#### (Key-Value) Database
``` node
from weave import Database
var db = new Database('kv', {                 // specify db type 
                        hashkey: "date",      // name of hash key
                        rangekey: "time",     // name of range key 
                      })

```
