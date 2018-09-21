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
// chalk = require("chalk") // for coloring output

program
  .option('-p, --provider <provider>', 'The cloud service provider to deploy to.')
  .action(function(file) {
    provider = program.provider

    if (program.provider === 'aws') {
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

      // Write to provider.tf file
      fs.writeFile("./" + program.provider + ".tf", genesis.toString(), function(err) {
          if (err) {
            return console.log(err)
          }
          console.log("AWS Terraform File Saved")
      });
    }

    // TODO: call terraform apply from here
    // call terraform apply behind the scenes
    // let execCallback = (error, stdout, stderr) => {
    //     if (error) console.log("exec error: " + error);
    //     if (stdout) console.log("Result: " + stdout);
    //     if (stderr) console.log("shell error: " + stderr);
    //   };
    // exec('terraform apply', execCallback)
  })
  .parse(process.argv);
