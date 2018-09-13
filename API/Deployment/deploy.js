#!/usr/bin/env node

// Called on `weave deploy`
// Creates the necessary higher level terraform config
//  0. prompts for provider
//  1. region variable
//  2. prompts for provider variables if not already set
//  3. roles and connects them to relevant resources
const GenesisDevice = require('genesis-device'); // takes JS and turns into .tf
const genesis = new GenesisDevice();
var program = require('commander');

var provider = null

program
  .option('-p, --provider <provider>', 'The cloud service provider to deploy to.')
  .action(function(file) {
    provider = program.provider
  })
  .parse(process.argv);

console.log(provider)

// create terraform config for AWS




// Write to aws.tf file
fs.writeFile("./aws.tf", genesis.toString(), function(err) {
    if (err) {
      return console.log(err)
    }
    console.log("AWS Terraform File Saved")
});
