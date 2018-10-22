const GenesisDevice = require('genesis-device'); // takes JS and turns into .tf
const genesis = new GenesisDevice();
var fs = require('fs');

class Database {
  constructor(params) {
    this.type = "Database"

    this.name = params.name
    this.key = params.key
    this.key_type = params.key_type

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
    this.docClient = new AWS.DynamoDB.DocumentClient({
        region: 'us-east-2',
        endpoint: 'https://dynamodb.us-east-2.amazonaws.com'
    })
    // }
  }


  terraform() {
    console.log(this.key)
    console.log(this.key_type)

    genesis.addResource('aws_dynamodb_table', 'sample-table', {
      name: this.name,
      hash_key: this.key,
      write_capacity: this.write_cap,
      read_capacity: this.read_cap,
      $inlines: [
        ['attribute', {
          name: this.key,
          type: this.key_type
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


  // get the tables in the kvdb
  tables() {

  }

  async put(entry) {
    if (this.service === 'aws') {
      params = {}
      params["TableName"] = this.name
      params["Items"][this.key] = entry['key']
      params["Items"]["value"] = entry['value']
      try {
        await this.docClient.put(params).promise()
      } catch (error) {
        console.log(error)
      }
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
