#!/usr/bin/env node
const Database = require('../Database/Database.js')
const Lambda = require('../Lambda/Lambda.js')

// TODO: READ IN SPECIFIED JSON FILE
var testjson = {
  "resources": [
    {
      "type": "function",
      "params": {
        "name": "testfunction",
        "http": {
          "method": 'get',
          "path": 'becool'
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
      },
    }
  ]
}

// Take JSON deployment specification
// and create a deployment package from it
function deployFromJSON(json) {
  for (rsc of json.resources) {
    console.log(rsc)
    if (rsc.type.toLowerCase() === 'function') {
      new Lambda(rsc.params).terraform()
    } else if (rsc.type.toLowerCase() === 'database') {
      new Database(rsc.params).terraform()
    }
  }
}

deployFromJSON(testjson)

module.exports = deployFromJSON
