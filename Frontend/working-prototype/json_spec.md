# JSON Spec for Resources

``` js
{
  "provider": "aws",
  "resources": [
```
### Function
``` js
    {
      "type": "function",
      "params": {
        "name": "testfunction",   // required
        "frequency": "1 minute"   // optional
        "http": {                 // optional
          "method": "get",          // required | http
          "path": "becool"          // required | http
        },
        "handler": "test.js"      // required
      },
      "resources": ["databae"]
    },
```
### Database
``` js
    {
      "type": "database",
      "params": {
        "name": "mydb",
        "hashkey": "ssn",         // required
        "sortkey": "age",         // optional
        "read_cap": 5,            // totally optional
        "write_cap": 5            // totally optional
      }
    }
  ]
}

```
