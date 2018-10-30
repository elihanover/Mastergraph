const GenesisDevice = require('genesis-device'); // takes JS and turns into .tf
const genesis = new GenesisDevice();
var fs = require('fs');

class Lambda {
  constructor(params, func) {
    this.name = params.name
    this.frequency = params.frequency
    this.http = params.http
    this.resources = params.resources
    this.filename = this._getCallerFile()
    this.handler = params.handler || params.name
    this.handler += '.handler'
    this.function = func

    this.runtime = "nodejs8.10" // TODO: needs to be inferred

    this.provider = 'aws'
  }

  ////////////////
  // Lambda API //
  ////////////////
  async trigger(params) {
    const AWS = require('aws-sdk')
    var lambda = new AWS.Lambda();
    console.log('Invoking: ' + this.name)
    await lambda.invoke({
      "FunctionName": this.name,
      "Payload": params
    }, (err, data) => {
      if (err) {
        console.log("Error invoking function: " + this.name)
        console.log(err, err.stack)
      } else {
        console.log("Function Response Data: ")
        console.log(JSON.stringify(data))
      }
    }).promise()
    console.log('Invoked: ' + this.name)
  }

  //////////////////////
  // Helper Functions //
  //////////////////////

  // Saves the terraform config for this lambda to a output file
  // This layer of abstraction just decides which provider to call
  terraform() {
    if (this.function) this.writeFunctionToFile() // write lambda to its own file

    const role_id = "iam_for_" + this.name
    genesis.addResource('aws_iam_role', role_id, {
      name: role_id,
      assume_role_policy: "${data.aws_iam_policy_document.policy.json}"
    })

    // add lambda resource
    genesis.addResource('aws_lambda_function', this.name, {
      function_name: this.name,

      role: "${aws_iam_role." + role_id + ".arn}",
      handler: this.handler + '.handler',
      runtime: this.runtime,
      memory_size: "256",
      timeout: "10",

      filename: this.name + ".zip"
    })

    // create deployment zip for function
    var archiver = require('archiver');
    var archive = archiver('zip');
    var output = fs.createWriteStream(this.name + '.zip');
    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    archive.on('error', function(err){
      throw err;
    });

    archive.pipe(output);
    archive.glob(this.handler)
    archive.glob('node_modules/**')
    archive.finalize();

    // set up cron job
    if (this.frequency) {
      genesis.addResource('aws_cloudwatch_event_rule', 'frequency', {
        name: 'frequency_of_' + this.name,
        schedule_expression: 'rate(' + this.frequency + ')'
      })

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

    // Set up API endpoint
    if (this.http) {
      // Gateway Resource
      genesis.addResource('aws_api_gateway_resource', this.name, {
        rest_api_id: "${aws_api_gateway_rest_api.api_gateway.id}",
        parent_id: "${aws_api_gateway_rest_api.api_gateway.root_resource_id}",
        path_part: this.http.path
      })

      // Gateway Method
      genesis.addResource('aws_api_gateway_method', this.name, {
        rest_api_id: "${aws_api_gateway_rest_api.api_gateway.id}",
        resource_id: "${aws_api_gateway_resource." + this.name + ".id}",
        http_method: "GET",
        authorization: "NONE"
      })

      // Gateway Integration
      genesis.addResource('aws_api_gateway_integration', this.name, {
        rest_api_id: "${aws_api_gateway_rest_api.api_gateway.id}",
        resource_id: "${aws_api_gateway_method." + this.name + ".resource_id}",
        http_method: "${aws_api_gateway_method." + this.name + ".http_method}",

        integration_http_method: "POST",
        type: "AWS_PROXY",
        uri: "${aws_lambda_function." + this.name + ".invoke_arn}"
      })

      // Gateway Deployment
      genesis.addResource('aws_api_gateway_deployment', this.name + '_aws_api_gateway_deployment', {
        depends_on: [
          "aws_api_gateway_integration." + this.name,
        ],

        rest_api_id: "${aws_api_gateway_rest_api.api_gateway.id}",
        stage_name: "hello"
      })

      // Give permission to call lambda
      genesis.addResource('aws_lambda_permission', this.name + '_apigw', {
        statement_id: "AllowAPIGatewayInvoke",
        action: "lambda:InvokeFunction",
        function_name: "${aws_lambda_function." + this.name + ".arn}",
        principal: "apigateway.amazonaws.com",

        // The /*/* portion grants access from any method on any resource
        // within the API Gateway "REST API".
        source_arn: "${aws_api_gateway_deployment." + this.name + "_aws_api_gateway_deployment.execution_arn}/*/*"
      })
    }


    // Attach policy to role
    genesis.addResource('aws_iam_role_policy', this.name + '-cloudwatch-log-group', {
      name: this.name + "-cloudwatch-log-group",
      role: "${aws_iam_role." + role_id + ".name}",
      policy: "${data.aws_iam_policy_document." + this.name + "-cloudwatch-log-group-policy.json}"
    })

    // Create log stream and write logs
    genesis.addData('aws_iam_policy_document', this.name + '-cloudwatch-log-group-policy', {
      statement: {
        actions: [
          "logs:*",
        ],
        resources: [
          "arn:aws:logs:*:*:*"
        ]
      }
    })

    genesis.addResource('aws_iam_role_policy_attachment', this.name + '_db_access', {
      role: "${aws_iam_role." + role_id + ".name}",
      policy_arn: "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
    })

    genesis.addResource('aws_iam_role_policy_attachment', this.name + "_lambda_access", {
      role: "${aws_iam_role." + role_id + ".name}",
      policy_arn: "arn:aws:iam::aws:policy/AWSLambdaFullAccess"
    })

    // write genesis.toString() to terraform config template
    fs.writeFile("./ " + this.filename.replace(".js", "") + ".tf", genesis.toString(), function(err) {
        if (err) {
          return console.log(err)
        }
        console.log("The file was saved!")
    });
  }

  writeFunctionToFile() {
    // write resources into function
    var header = "const weave = require('weaveapi')\n"
    for (var i in this.resources) {
      console.log(this.resources[i])
      const resource = JSON.stringify(this.resources[i])
      header += "var " + this.resources[i]["name"] + " = " + "new weave." + this.resources[i]['type'] + "(" + resource + ")\n"
    }
    // create file called this.name.js with the function in it
    const n = this.function.toString().indexOf('(')
    var function_body = this.function.toString().slice(0,n) + ' handler' + this.function.toString().slice(n) + '\nexports.handler = handler'
    fs.writeFile(this.name + '.js', header + function_body, (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        console.log(this.name + '.js updated.');
    });
  }

  _getCallerFile() {
    var originalFunc = Error.prepareStackTrace;

    var callerfile;
    try {
        var err = new Error();
        var currentfile;

        Error.prepareStackTrace = function (err, stack) { return stack; };

        currentfile = err.stack.shift().getFileName();

        while (err.stack.length) {
            callerfile = err.stack.shift().getFileName();

            if(currentfile !== callerfile) break;
        }
    } catch (e) {}

    Error.prepareStackTrace = originalFunc;

    return callerfile.slice(callerfile.lastIndexOf('/')+1)
  }
}

module.exports = Lambda
