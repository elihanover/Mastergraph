// import weave
const {test} = require('./resources')
var fs = require('fs')

var resources = {
  test
}

// yml-ize weaved resources for serverless.yml
function ymlize(components) {
  // construct JSON to feed into serverless.yml
  var functions = {}
  var resources = {}

  for (i in components) {
    console.log(i)
    console.log(components[i])

    // figure out how to format functions and resources
    console.log(typeof components[i])
    if (typeof components[i] === 'Lambda') {
      functions[i] = components[i].yml()
      console.log(functions[i])
    }

    // deal with other resource types?????
  }

  var sls = JSON.stringify(functions, null, 4)
  var rsc = JSON.stringify(resources, null, 4)
  fs.writeFile('functions.json', sls, 'utf8', function(){})
  fs.writeFile('resources.json', rsc, 'utf8', function(){})
}

ymlize(resources)
