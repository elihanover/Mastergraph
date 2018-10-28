#!/usr/bin/env node
const GenesisDevice = require('genesis-device'); // takes JS and turns into .tf
const genesis = new GenesisDevice();
const terraform_provider = require('../config/terraform').terraform_provider
var fs = require('fs');
var program = require('commander');
// chalk = require("chalk") // for coloring output

program
  .option('-p, --provider <provider>', 'The cloud service provider to deploy to.')
  .action(function(filename) {
    provider = program.provider || 'aws'

    // TODO: gather resources and terraform them
    

    // create terraform resources for specified provider
    terraform_provider(provider)
  })
  .parse(process.argv);
