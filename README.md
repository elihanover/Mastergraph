# Weave API

### Resources
#### Lambda Functions
``` python
from weave import Lambda
var test = new Lambda({
    http: "get test",         # http request path
    frequency: "1m",          # cron job frequency
    resources: [db, myqueue]  # dependent resources callable within lambda
  },
  function() {                # actual function logic
    console.log("Test b0iii")
  }
)
```
#### (Key-Value) Database
``` python
from weave import Database
var db = new Database('kv', {                 # specify db type 
                        hashkey: "date",      # name of hash key
                        rangekey: "time",     # name of range key 
                      })

```
