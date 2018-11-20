import React, { Component } from 'react';

export default class SVGComponent extends Component {
  render() {
    return <svg style={{margin: 0, zIndex:9000}} {...this.props} ref="svg">{this.props.children}</svg>;
  }
}
