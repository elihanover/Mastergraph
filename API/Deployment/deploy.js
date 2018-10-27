#!/usr/bin/env node

// Called on `weave deploy`
// Creates the necessary higher level terraform config
//  0. prompts for provider
//  1. region variable
//  2. prompts for provider variables if not already set
//  3. roles and connects them to relevant resources
const GenesisDevice = require('genesis-device'); // takes JS and turns into .tf
const genesis = new GenesisDevice();
var fs = require('fs');
var program = require('commander');
exec = require('child_process').exec;
spawn = require('child_process').spawn;
// chalk = require("chalk") // for coloring output

console.log("hey there")

program
  // .command('deploy')
  .option('-p, --provider <provider>', 'The cloud service provider to deploy to.')
  .action(async function() {
    provider = program.provider || 'aws'

    // TODO: gather resources and terraform them
    console.log('hiya')

    // create terraform resources for specified provider
    terraform_provider(provider)

    // TODO call terraform plan apply behind the scenes
    // exec('terraform apply', (err, stdout, stderr) => {
    //   console.log("hi")
    //   if (err) {
    //     console.log( `err: ${err}`)
    //     return;
    //   }
    //
    //   // the *entire* stdout and stderr (buffered)
    //   console.log(`stdout: ${stdout}`);
    //   console.log(`stderr: ${stderr}`);
    // })
    console.log('ho')
  })
  .parse(process.argv);


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
