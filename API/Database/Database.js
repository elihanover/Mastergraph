const GenesisDevice = require('genesis-device'); // takes JS and turns into .tf
const genesis = new GenesisDevice();
var fs = require('fs');

class Database {
  constructor(params) {
    this.type = "Database"

    this.name = params.name
    this.key = params.key
    // this.key_type = params.key_type // ASSUME STRING BC HASH KEY

    this.read_cap = params.read_capacity
    this.write_cap = params.write_capacity

    if (!params.read_capacity) {
      this.read_cap = 5 // NOTE: totally arbitrary
    }
    if (!params.write_capacity) {
      this.write_cap = 5
    }

    // if (this.service === 'aws') {
    const AWS = require('aws-sdk')
    // this.docClient = new AWS.DynamoDB.DocumentClient({
    //     region: 'us-east-1',
    //     endpoint: 'https://dynamodb.us-east-1.amazonaws.com'
    // })
    this.docClient = new AWS.DynamoDB.DocumentClient()
    // }
  }


  terraform() {
    console.log(this.key)
    console.log(this.key_type)

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
    var params = {}
    params["TableName"] = this.name
    params["Item"] = {}
    params["Item"][this.key] = entry['key']
    params["Item"]["value"] = entry['value']
    try {
      console.log("about to make call")
      console.log("params: " + JSON.stringify(params))
      let res = await this.docClient.put(params, (err, data) => {
        if (err) {
          console.log("error")
          console.log(JSON.stringify(err))
          return JSON.stringify(err)
        }
        else {
          console.log("data")
          console.log(JSON.stringify(data))
          return JSON.stringify(data)
        }
      }).promise()
    } catch (error) {
      console.log("error tho")
      return error
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
