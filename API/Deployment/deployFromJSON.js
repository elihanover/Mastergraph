#!/usr/bin/env node
const Database = require('../Database/Database.js')
const Lambda = require('../Lambda/Lambda.js')
const GenesisDevice = require('genesis-device'); // takes JS and turns into .tf
const genesis = new GenesisDevice();
const program = require('commander');
const fs = require('fs');

program
  .action(function(filename) {
    // read in json from file
    const json = JSON.parse(fs.readFileSync(filename, 'utf8'));

    // terraform provider config
    terraform_provider(json.provider)

    // terraform each resources by type
    for (rsc of json.resources) {
      if (rsc.type.toLowerCase() === 'function') {
        new Lambda(rsc.params).terraform()
      } else if (rsc.type.toLowerCase() === 'database') {
        new Database(rsc.params).terraform()
      }
    }
  })
  .parse(process.argv)


  // DUPLICATE, REFACTOR FOR ONLY 1
  function terraform_provider(provider) {
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
