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
    console.log(__filename)
    console.log(__dirname)

    // User defined
    this.function = func
    this.name = params.name
    this.frequency = params.frequency
    this.http = params.http

    // NOTE The eventual .tf config file will be in a config folder so our path will be relative to that
    this.handler = "../resources" + __filename.replace(__dirname, '').replace('.js', '') + "." + this.name // TODO: ELEGANCE
    this.runtime = "nodejs6.10" // TODO: needs to be inferred
  }

  // Saves the terraform config for this lambda to a output file
  terraform(filename) {
    console.log(filename)

    // create role
    const role_id = "iam_for_" + this.name
    genesis.addResource('aws_iam_role', role_id, {
      name: role_id,
      assume_role_policy: "${data.aws_iam_policy_document.policy.json}"
    })

    // add lambda resource
    genesis.addResource('aws_lambda_function', this.name, {
      function_name: this.name,

      role: "${aws_iam_role." + role_id + ".arn}",
      handler: filename.replace('.js', '') + "." + this.name,
      runtime: this.runtime,

      filename: "${data.archive_file.zip.output_path}",
      source_code_hash: "${data.archive_file.zip.output_sha}"
    })

    // add zip
    genesis.addData('archive_file', 'zip', {
      type: "zip",
      source_file: filename,
      output_path: filename.replace('.js', '.zip')
    })

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
