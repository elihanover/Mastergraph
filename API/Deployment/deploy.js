#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');

// Deployment Cases:
//  1. deploy through JSON (done)
//  2. deploy through js objects in specified file (done)
//  3. deploy through deployment object in specified file
program
  // .command('deploy <filename>')
  .action((filename, provider = 'aws', backend = 'terraform') => {

    // import necessary config backend
    backend = require('../backends/' + backend.toLowerCase() + '.js');
    backend.config_provider(provider)

    const filetype = filename.substring(filename.lastIndexOf('.')+1)
    if (filetype === 'json') {
      // JSON specified deployment
      const deployment = JSON.parse(fs.readFileSync(filename, 'utf8'));
      backend.config_resources(deployment.resources)
    }
    else if (filetype === 'js') {
      // js object specified deployment
      const resources = require(process.cwd() + '/' + filename)
      Object.keys(resources).map((rsc) => {
        resources[rsc].terraform()
      })
    }
  })
  .parse(process.argv)
