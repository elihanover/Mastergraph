const Database = require('../Resources/Database.js')
const Lambda = require('../Resources/Lambda.js')
const GenesisDevice = require('genesis-device'); // takes JS and turns into .tf
const genesis = new GenesisDevice();
const fs = require('fs');


class Terraform {
  // Create terraform file based on resource type
  // Calls each classes terraform method
  static config_resources(resources) {
    resources.map((rsc) => {
      if (rsc.type.toLowerCase() === 'function') {
        new Lambda(rsc.params).terraform()
      } else if (rsc.type.toLowerCase() === 'database') {
        new Database(rsc.params).terraform()
      }
    })
  }

  static config_provider(provider) {
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
      fs.writeFile("./" + provider + ".tf", genesis.toString(), function(err) {
          if (err) {
            return console.log(err)
          }
          console.log("AWS Terraform File Saved")
      });
    }
  }
}

module.exports = Terraform
