const GenesisDevice = require('genesis-device'); // takes JS and turns into .tf
const genesis = new GenesisDevice();
var fs = require('fs');

class Database {
  constructor(params) {
    this.type = 'Database'
    this.name = params.name
    this.hashkey = params.hashkey // NOTE: assuming string because hash_key
    this.sortkey = params.sortkey
    this.attributes = params.attributes

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
  }


  ////////////////////
  // GENERAL DB API //
  ////////////////////
  async put(entry) {
    var params = {
      "TableName": this.name,
      "Item": entry
    }
    try {
      console.log("Request Parameters: " + JSON.stringify(params))
      await this.docClient.put(params, (err, data) => {
        if (err) {
          console.log(err, err.stack)
          return JSON.stringify(err)
        }
        return JSON.stringify(data)
      }).promise()
    } catch (error) {
      console.log(error, error.stack)
    }
  }

  // Get specified entry using hash (and maybe sort) key
  /* Key must have format:
      {
        'hashkey': _____,
        'sortkey': _____  // (optional)
      }
  */
  async get(key) {
    try {
      await this.docClient.get({
        TableName: this.name,
        Key: key
      }, (err, data) => {
        console.log("HI THERE")
        if (err) {
          console.log(err, err.stack)
          return JSON.stringify(err)
        }
        console.log("DATA")
        console.log(JSON.stringify(data))
        return JSON.stringify(data)
      }).promise()
    } catch (error) {
      console.log(error, error.stack)
    }
  }


  ////////////////////
  // Config Methods //
  ////////////////////

  // terraform compiles database object into terraform config
  terraform() {
    var table = {
      name: this.name,
      hash_key: this.hashkey,
      write_capacity: this.write_cap,
      read_capacity: this.read_cap,
      $inlines: [
        ['attribute', {
          name: this.hashkey,
          type: "S"
        }]
      ]
    }

    // if optional sortkey, add to terraform config
    if (this.sortkey !== undefined) {
      table.range_key = this.sortkey // add optional sort key
      table.$inlines.push([
        'attribute', {
          name: this.sortkey,
          type: 'S'
        }]
      )
    }

    genesis.addResource('aws_dynamodb_table', this.name, table)

    fs.writeFile("./ " + this.name + ".tf", genesis.toString(), function(err) {
        if (err) {
          return console.log(err)
        }
    });
  }
}

module.exports = Database
