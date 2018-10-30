#!/usr/bin/env node
const Lambda = require('./Resources/Lambda.js')
const Database = require('./Resources/Database.js')
const deploy = require('./Deployment/deploy.js')
module.exports = {Lambda, Database, deploy}
// var program = require('commander');
//
// program
//   .arguments('<file>')
//   .option('-u, --username <username>', 'The user to authenticate as')
//   .option('-p, --password <password>', 'The user\'s password')
//   .action(function(file) {
//     console.log('user: %s pass: %s file: %s',
//         program.username, program.password, file);
//
//     // TODO: export to serverless yml and then serverless deploy
//
//
//   })
//   .parse(process.argv);
