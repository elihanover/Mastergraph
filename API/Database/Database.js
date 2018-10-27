const GenesisDevice = require('genesis-device'); // takes JS and turns into .tf
const genesis = new GenesisDevice();
var fs = require('fs');

class Database {
  constructor(params) {
    // this.type = "Database"

    this.name = params.name
    this.key = params.key // NOTE: assuming string because hash_key

    this.read_cap = params.read_capacity
    this.write_cap = params.write_capacity

    if (!params.read_capacity) {
      this.read_cap = 5 // NOTE: totally arbitrary
    }
    if (!params.write_capacity) {
      this.write_cap = 5
    }

    const AWS = require('aws-sdk')
    this.docClient = new AWS.DynamoDB.DocumentClient()

    // this.terraform()
  }


  terraform() {
    genesis.addResource('aws_dynamodb_table', 'sample-table', { // TODO: WHY SAMPLE-TABLE??? SHOULD BE this.name
      name: this.name,
      hash_key: this.key,
      write_capacity: this.write_cap,
      read_capacity: this.read_cap,
      $inlines: [
        ['attribute', {
          name: this.key,
          type: "S"
        }]
      ]
    })

    fs.writeFile("./ " + this.name + ".tf", genesis.toString(), function(err) {
        if (err) {
          return console.log(err)
        }
        console.log("The file was saved!")
    });
  }



  ////////////////////
  // GENERAL DB API //
  ////////////////////
  async put(entry) {
    console.log("please just get here")
    var params = {
      "TableName": this.name,
      "Item": {
        "value": entry["value"]
      }
    }
    params["Item"][this.key] = entry["key"]
    try {
      console.log("Request Parameters: " + JSON.stringify(params))
      let res = await this.docClient.put(params, (err, data) => {
        if (err) {
          console.log(err, err.stack)
          return JSON.stringify(err)
        }
        else {
          return JSON.stringify(data)
        }
      }).promise()
    } catch (error) {
      console.log(error, error.stack)
    }
  }

  async query(entry) {
    var result = null
    if (this.service === 'aws') {
      try {
        result = await docClient.query({
          TableName: this.name,
          KeyConditionExpression: '',
          ExpressionAttributeValues: {}
        }).promise()
      } catch (error) {
        console.log(error)
      }
    }

    return result
  }
}

module.exports = Database
