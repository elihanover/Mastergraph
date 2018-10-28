#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');

program
  .action((filename, provider = 'aws', backend = 'terraform') => {
    // read in deployment json
    const deployment = JSON.parse(fs.readFileSync(filename, 'utf8'));

    // import necessary config backend
    backend = require('../backends/' + backend.toLowerCase() + '.js');
    backend.config_provider(provider)
    backend.config_resources(deployment.resources)
  })
  .parse(process.argv)
