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

    // create file called this.name.js with the function in it
    var function_body = this.function.toString().slice(0,8) + ' handler' + this.function.toString().slice(8) + 'exports.handler = handler'
    fs.writeFile(this.name + '.js', function_body, (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        console.log(this.name + '.js updated.');
    });

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
      handler: this.name + '.handler',
      runtime: this.runtime,

      filename: "${data.archive_file.zip.output_path}",
      source_code_hash: "${data.archive_file.zip.output_sha}"
    })

    // add zip
    genesis.addData('archive_file', 'zip', {
      type: 'zip',
      source_file: this.name + '.js',
      output_path: this.name + '.zip'
    })


    if (this.frequency) {
      // add cron frequency rule with specified frequency
      genesis.addResource('aws_cloudwatch_event_rule', 'frequency', {
        name: 'frequency_of_' + this.name,
        schedule_expression: 'rate(' + this.frequency + ')'
      })

      //
      genesis.addResource('aws_cloudwatch_event_target', this.name + '_frequency', {
        rule: '${aws_cloudwatch_event_rule.frequency.name}',
        target_id: this.name,
        arn: '${aws_lambda_function.' + this.name + '.arn}'
      })

      // give cloudwatch permission to call function
      genesis.addResource('aws_lambda_permission', 'allow_cloudwatch_to_call_' + this.name, {
        statement_id: 'AllowExecutionFromCloudWatch',
        action: 'lambda:InvokeFunction',
        function_name: '${aws_lambda_function.' + this.name + '.function_name}',
        principal: 'events.amazonaws.com',
        source_arn: '${aws_cloudwatch_event_rule.frequency.arn}'
      })
    }



    // write genesis.toString() to terraform config template
    fs.writeFile("./" + this.name + ".tf", genesis.toString(), function(err) {
        if (err) {
          return console.log(err)
        }
        console.log("The file was saved!")
    });
  }
}

module.exports = Lambda
