const GenesisDevice = require('genesis-device'); // takes JS and turns into .tf
const genesis = new GenesisDevice();
var fs = require('fs');

/*
  Lambda(params, function)
  params =
*/
class Lambda {
  // TODO: constructor must take in all the config arguments
  //       and infer other needed information
  constructor(params, func) {
    // User defined
    this.function = func
    this.frequency = params.frequency
    this.http = params.http

    this.name = params.name
    // NOTE The eventual .tf config file will be in a config folder
    // so our path will be relative to that
    // TODO: There's gotta be a more elegant way of doing this
    this.handler = "../resources" + __filename.replace(__dirname, '').replace('.js', '') + "." + this.name // TODO: INFER HANDLER
  }

  // Saves the terraform config for this lambda to a output file
  terraform() {
    // Add basic resource config
    genesis.addResource('aws_lambda_function', this.name, {
      function_name: this.name,

      // The bucket name as created earlier with "aws s3api create-bucket"
      s3_bucket: "terraform-serverless-example",
      s3_key:"v1.0.0/example.zip",

      // "main" is the filename within the zip file (main.js) and "handler"
      // is the name of the property under which the handler function was
      // exported in that file.
      handler: this.handler,
      runtime: "nodejs6.10", // TODO: get runtime

      role: "${aws_iam_role.lambda_exec.arn}"
    })

    // Build other resources we need
    if (this.http !== null) {
      // add api gateway resource and all that jazz
      console.log(this.http)
    }
    if (this.frequency !== null) {
      // add cron job resource
      console.log(this.frequency)
    }

    console.log(genesis.toString())


    // write genesis.toString() to terraform config template
    // TODO: where to actually write this file to?
    //        probably we want to create some config folder
    //        and throw everything in there
    fs.writeFile("./" + this.name + ".tf", genesis.toString(), function(err) {
        if (err) {
          return console.log(err)
        }
        console.log("The file was saved!")
    });
  }
}

module.exports = Lambda
