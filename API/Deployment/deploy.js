#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const exec = require('child_process').exec;
const child = require('child_process').child;

// Deployment Cases:
//  1. deploy through JSON (done)
//  2. deploy through js objects in specified file (done)
//  3. deploy through deployment object in specified file
program
  .action((filename, uh='', provider = 'aws', backend = 'terraform') => {

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

    // exec("echo 'yes' | terraform apply", (error, stdout, stderr) => {
    //   console.log('stdout: ' + stdout);
    //     console.log('stderr: ' + stderr);
    //     if (error !== null) {
    //          console.log('exec error: ' + error);
    //     }
    // })
  })
  .parse(process.argv)
