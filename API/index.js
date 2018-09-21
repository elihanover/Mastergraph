#!/usr/bin/env node
console.log('testing 1 2 3')
const Lambda = require('./Lambda/Lambda.js')
console.log("lambda: " + JSON.stringify(Lambda, null, 4))
const Database = require('./Database/Database.js')
console.log("database: " + JSON.stringify(Database, null, 4))
const deployLambda = require('./Deployment/deploy.js')
module.exports = {Lambda, Database, deployLambda}
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
