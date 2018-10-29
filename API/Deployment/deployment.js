////////////////////
// IGNORE FOR NOW //
////////////////////

const GenesisDevice = require('genesis-device'); // takes JS and turns into .tf
const genesis = new GenesisDevice();
var fs = require('fs');

// Deployment object
/* Usage
var dep1 = weave.Deployment({
  name: "testdeployment",
  resources: {
    "name_of_resource": resource object,
    "myfunction1": test,
    "func2": test2,
    "myapi": testAPI,
    "accountsdb": acct_db
  }
})

In CLI:
weave deploy deployment_name -p provider_name

or

weave deploy
--> Prompts for which deployment you want and then which provider
ex:
  Select deploment:
    - deployment1:
      -> Resources:
          - name_of_resource (resource type)
          - my_function (serverless function)
          - func2 (serverless function)
          - myapi (api)
          - accountsdb (database)
    - deployment2:
      -> Resources:
          - ...

  Select provider:
    (1) AWS
    (2) GCloud
    (3) Microsoft Azure
    (4) Alibaba Cloud
    ...

*/
// TODO: How to gather deployment objects???
// TODO: How to gather listed resources?
class Deployment {
  constructor(params) {
    this.name = params.name
    this.resources = params.resources
  }

  // terraform this resources to a given provider
  terraform(provider) {
    if (provider === 'aws') {
      genesis.addVariable('aws_region', {
        description: "The AWS region to create things in.",
        default: "us-east-1"
      })

      genesis.addProvider('aws', {
        region: "${var.aws_region}"
      })

      genesis.addProvider('archive', {})

      genesis.addData('aws_iam_policy_document', 'policy', {
        statement: {
          sid: "",
          effect: "Allow",

          principals: {
            identifiers: ["lambda.amazonaws.com"],
            type: "Service"
          },

          actions: ["sts:AssumeRole"]
        }
      })

      // The "REST API" is the container for all of the other API Gateway objects
      // NOTE: ASSUME WE WANT ONE, HOW TO SPECIFY IF NOT
      genesis.addResource('aws_api_gateway_rest_api', 'api_gateway', {
        name: "AWS_API_Gateway",
        description: "AWS API Gateway"
      })

      // Write to provider.tf file
      fs.writeFile("./" + program.provider + ".tf", genesis.toString(), function(err) {
          if (err) {
            return console.log(err)
          }
          console.log("AWS Terraform File Saved")
      });
    }
  }
