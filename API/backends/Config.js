function deployFromJSON(deployment, provider, backend) {
  // import necessary config backend
  backend = require('./' + backend.toLowerCase() + '.js');
  backend.config_provider(provider)
  backend.config_resources(deployment.resources)
}

module.exports = {deployFromJSON}
