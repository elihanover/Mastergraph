#!/usr/bin/env node
const Lambda = require('./Resources/Lambda.js')
const Database = require('./Resources/Database.js')
const deploy = require('./Deployment/deploy.js')
module.exports = {Lambda, Database, deploy}
