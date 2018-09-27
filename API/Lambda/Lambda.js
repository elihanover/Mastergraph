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

    if (this.http) {
      // TODO: this should be in AWS.tf
      // Don't want to create a new one for each lambda
      // Configure root REST API object
      // The "REST API" is the container for all of the other API Gateway objects
      genesis.addResource('aws_api_gateway_rest_api', 'api_gateway', {
        name: "AWS_API_Gateway",
        description: "AWS API Gateway"
      })
      /////
      genesis.addResource('aws_api_gateway_resource', this.name, {
        rest_api_id: "${aws_api_gateway_rest_api.api_gateway.id}",
        parent_id: "${aws_api_gateway_rest_api.api_gateway.root_resource_id}",
        path_part: this.name + '.' + this.http.path
      })

      genesis.addResource('aws_api_gateway_method', this.name, {
        rest_api_id: "${aws_api_gateway_rest_api.api_gateway.id}",
        resource_id: "${aws_api_gateway_resource." + this.name + ".id}",
        http_method: "GET",
        authorization: "NONE"
      })
      ///////

      genesis.addResource('aws_api_gateway_resource', 'proxy', {
        rest_api_id: "${aws_api_gateway_rest_api.api_gateway.id}",
        parent_id: "${aws_api_gateway_rest_api.api_gateway.root_resource_id}",
        path_part: "{proxy+}"
      })

      genesis.addResource('aws_api_gateway_method', 'proxy', {
        rest_api_id: "${aws_api_gateway_rest_api.api_gateway.id}",
        resource_id: "${aws_api_gateway_resource.proxy.id}",
        http_method: "ANY",
        authorization: "NONE"
      })

      // Specify where incoming requests are routed
      genesis.addResource('aws_api_gateway_integration', this.name, {
        rest_api_id: "${aws_api_gateway_rest_api.api_gateway.id}",
        resource_id: "${aws_api_gateway_method.proxy.resource_id}",
        http_method: "${aws_api_gateway_method.proxy.http_method}",

        integration_http_method: "POST",
        type: "AWS_PROXY",
        uri: "${aws_lambda_function." + this.name + ".invoke_arn}"
      })

      // genesis.addResource('aws_api_gateway_method', 'proxy_root', {
      //   rest_api_id: "${aws_api_gateway_rest_api.api_gateway.id}",
      //   resource_id: "${aws_api_gateway_rest_api.api_gateway.root_resource_id}",
      //   http_method: "ANY",
      //   authorization: "NONE"
      // })
      //
      // genesis.addResource('aws_api_gateway_integration', 'lambda_root', {
      //   rest_api_id: "${aws_api_gateway_rest_api.api_gateway.id}",
      //   resource_id: "${aws_api_gateway_method.proxy_root.resource_id}",
      //   http_method: "${aws_api_gateway_method.proxy_root.http_method}",
      //
      //   integration_http_method: "POST",
      //   type: "AWS_PROXY",
      //   uri: "${aws_lambda_function." + this.name + ".invoke_arn}"
      // })

      genesis.addResource('aws_api_gateway_integration', 'lambda_root', {
        rest_api_id: "${aws_api_gateway_rest_api.api_gateway.id}",
        resource_id: "${aws_api_gateway_method." + this.name + ".resource_id}",
        http_method: "${aws_api_gateway_method." + this.name + ".http_method}",

        integration_http_method: "POST",
        type: "AWS_PROXY",
        uri: "${aws_lambda_function." + this.name + ".invoke_arn}"
      })


      // Create an api deployment to activate config and expose api
      genesis.addResource('aws_api_gateway_deployment', 'aws_api_gateway_deployment', {
        depends_on: [
          "aws_api_gateway_integration." + this.name,
          "aws_api_gateway_integration.lambda_root",
        ],

        rest_api_id: "${aws_api_gateway_rest_api.api_gateway.id}",
        stage_name: "hello"
      })

      // give permission to call lambda
      genesis.addResource('aws_lambda_permission', 'apigw', {
        statement_id: "AllowAPIGatewayInvoke",
        action: "lambda:InvokeFunction",
        function_name: "${aws_lambda_function." + this.name + ".arn}",
        principal: "apigateway.amazonaws.com",

        // The /*/* portion grants access from any method on any resource
        // within the API Gateway "REST API".
        source_arn: "${aws_api_gateway_deployment.aws_api_gateway_deployment.execution_arn}/*/*"
      })

      genesis.addOutput('base_url', {
        value: "${aws_api_gateway_deployment.aws_api_gateway_deployment.invoke_url}"
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
