import React, {Component} from 'react';
import './App.css';

import Graph from './../components/graph/Graph'

// Need:
// API Gateway
// API endpoints
// User input testing
// Lambdas (with code editor inside)
// S3 Object storage
// NoSQL DB

var lambdaGraph = {
  "nodes": [
    {"nid":0, "type": "gateway", "title": "API Gateway", "x": 500, "y": 300, "fields": {"in":[{"name": "input"}],"out":[{"name":"Output 1"},{"name":"Output 2"},{"name":"Output 3"},{"name":"Output 4"}]}},
    {"nid":1, "type": "lambda", "parameters": ["userID", "metaData"], "title": "Create user", "x": 750, "y": 300, "fields": {"in":[{"name": "input"}],"out":[{"name":"output"}]}},
    {"nid":2, "type": "lambda", "parameters": ["userID", "metaData"], "title": "Read user", "x": 750, "y": 400, "fields": {"in":[{"name": "input"}],"out":[{"name":"output"}]}},
    {"nid":3, "type": "lambda", "parameters": ["userID", "metaData"], "title": "Delete user", "x": 750, "y": 500, "fields": {"in":[{"name": "input"}],"out":[{"name":"output"}]}},
    {"nid":4, "type": "lambda", "parameters": ["userID", "metaData"], "title": "Update user", "x": 750, "y": 600, "fields": {"in":[{"name": "input"}],"out":[{"name":"output"}]}}
  ],
  "connections":[
    {"from_node":0,"from":"Output 1","to_node":1,"to":"input"},
    {"from_node":0,"from":"Output 2","to_node":2,"to":"input"},
    {"from_node":0,"from":"Output 3","to_node":3,"to":"input"},
    {"from_node":0,"from":"Output 4","to_node":4,"to":"input"}
  ]
}

class App extends Component {

    constructor(props) {
      super(props);
      this.state = lambdaGraph;
    }

    onNewConnector = (fromNode,fromPin,toNode,toPin) => {
      let connections = [...this.state.connections, {
        from_node : fromNode,
        from : fromPin,
        to_node : toNode,
        to : toPin
      }]

      this.setState({connections: connections})
    }

    onRemoveConnector = (connector) => {
      let connections = [...this.state.connections]
      connections = connections.filter((connection) => {
        return connection != connector
      })
      this.setState({connections: connections})
    }

    onNodeMove = (nid, pos) => {
      console.log('end move : ' + nid, pos)
    }

    onNodeStartMove = (nid) => {
      console.log('start move : ' + nid)
    }

    handleNodeSelect = (nid) => {
      console.log('node selected : ' + nid)
    }

    handleNodeDeselect = (nid) => {
      console.log('node deselected : ' + nid)
    }

    render() {
        return (<div className="App">
        <Graph
          data={this.state}
          onNodeMove={(nid, pos)=>this.onNodeMove(nid, pos)}
          onNodeStartMove={(nid)=>this.onNodeStartMove(nid)}
          onNewConnector={(n1,o,n2,i)=>this.onNewConnector(n1,o,n2,i)}
          onRemoveConnector={(connector)=>this.onRemoveConnector(connector)}
          onNodeSelect={(nid) => {this.handleNodeSelect(nid)}}
          onNodeDeselect={(nid) => {this.handleNodeDeselect(nid)}}
          />
        </div>);
    }
}

export default App;
