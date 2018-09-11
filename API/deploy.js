//
// Deploy resources to specified web service
//
function deployLambda(resource, service='aws') {
  // deploy resource[i] on service
  console.log("Deploying " + resource + " on " + service)
  console.log(resource.params.http)


}


module.exports = deployLambda
