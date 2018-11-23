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

  ///////////////////////////////
  // Assignment / Modification //
  ///////////////////////////////

  // Set attribute at key to val
  // Creates that attr if undefined
  async set(key, attribute, val) {
    var params = {
      Key: key,
      UpdateExpression: "SET " + attribute + " = :val",
      ExpressionAttributeValues: {':val': val}
    }
    let res = await this.update(params)
    console.log("RES: " + JSON.stringify(res))
    return res
  }

  // Append val to list attribute with key.
  // (I think) Can exist
  async append(key, attribute, val) {           // ADDS TWICE, SO DOES PREPEND???
    // turn val into array if not an array
    if (!Array.isArray(val)) val = [val]
    var params = {
      Key: key,
      UpdateExpression: "SET " + attribute + " = list_append(" + attribute + ", :vals)",
      ExpressionAttributeValues: {':vals': val}
    }
    let res = await this.update(params)
    console.log(res)
    return res
  }

  // Prepend val to list attribute with key.
  // (I think) Can exist
  async prepend(key, attribute, val) {
    if (!Array.isArray(val)) val = [val]
    var params = {
      Key: key,
      UpdateExpression: "SET " + attribute + " = list_append(:vals, " + attribute + ")",
      ExpressionAttributeValues: {':vals': val}
    }
    let res = await this.update(params)
    console.log(res)
    return res
  }

  // Add val to number attribute at key
  // Must exist
  async add(key, attribute, val) {
    var params = {
      Key: key,
      UpdateExpression: "SET " + attribute + " = " + attribute + " + :val",
      ExpressionAttributeNames: {'#attr': attribute},
      ExpressionAttributeValues: {':val': val}
    }
    let res = await this.update(params)
    console.log(res)
    return res
  }


  //////////////////////////////////
  // AWS C.R.U.D. Helper Function //
  //////////////////////////////////

  // Put adds the given input to db
  // Note: This is not an update, but a full replace!
  // Item can exist but doesn't need to.
  async put(params) {
    params = {
      TableName: this.name,
      Item: params
    }
    try {
      console.log("PUT Request Parameters: " + JSON.stringify(params))
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

  async update(params) {
    params.TableName = this.name
    try {
      console.log("UPDATE Request Parameters: " + JSON.stringify(params))
      await this.docClient.update(params, (err, data) => {
        if (err) {
          console.log(err, err.stack)
          return err
        }
        console.log(JSON.stringify(data))
        return data
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
        if (err) {
          console.log(err, err.stack)
          return err
        }
        console.log(JSON.stringify(data))
        return data // why does this return null?
      }).promise()
    } catch (error) {
      console.log(error, error.stack)
    }
  }


  async delete(key) {
    try {
      await this.docClient.delete({
        TableName: this.name,
        Key: key
      }, (err, data) => {
        if (err) {
          console.log(err, err.stack)
          return err
        }
        console.log(JSON.stringify(data))
        return data
      }).promise()
    } catch(error) {
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
