#!/usr/bin/env node
const GenesisDevice = require('genesis-device'); // takes JS and turns into .tf
const terraform = require('../config/terraform.js').terraform
const terraform_provider = require('../config/terraform.js').terraform_provider
const genesis = new GenesisDevice();
const program = require('commander');
const fs = require('fs');

program
  .action(function(filename) {
    // read in deployment json from file
    const deployment = JSON.parse(fs.readFileSync(filename, 'utf8'));

    // terraform provider config
    terraform_provider(deployment.provider)

    // terraform each resource
    deployment.resources.map(terraform)
  })
  .parse(process.argv)
