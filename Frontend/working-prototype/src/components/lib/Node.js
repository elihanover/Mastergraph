import React, {Component} from 'react';

// Interaction
import onClickOutside from 'react-onclickoutside';
import Draggable from 'react-draggable'
import { Resizable, ResizableBox } from 'react-resizable';

// Lambda node stuff
import AceEditor from 'react-ace';
import brace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/terminal';

// Extra interface stuff
import { ButtonGroup, Button, Switch, Collapse } from "@blueprintjs/core";

import NodeInputList from './NodeInputList';
import NodeOuputList from './NodeOutputList';

class Node extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: false,
            code: '',
            codeIsOpen: false
        }
    }

    // MARK: UI Util
    getPos = (ui) => {
      return {
        x: ui.x,
        y: ui.y
      }
    }

    // MARK: Drag events
    handleDragStart(event, ui) {
        this.props.onNodeStart(this.props.nid, this.getPos(ui));
    }

    handleDragStop(event, ui) {
        this.props.onNodeStop(this.props.nid, this.getPos(ui));
    }

    handleDrag(event, ui) {
        this.props.onNodeMove(this.props.index, this.getPos(ui));
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.selected !== nextState.selected;
    }

    // MARK: Connection events
    onStartConnector(index) {
        this.props.onStartConnector(this.props.nid, index);
    }

    onCompleteConnector(index) {
        this.props.onCompleteConnector(this.props.nid, index);
    }

    // MARK: Click events
    handleClick(e) {
        this.setState({selected: true});
        if (this.props.onNodeSelect) {
            this.props
                .onNodeSelect(this.props.nid);
        }
    }

    handleClickOutside() {
        let {selected} = this.state;
        if (this.props.onNodeDeselect && selected) {
            this.props
                .onNodeDeselect(this.props.nid);
        }
        this.setState({selected: false});
    }

    onCodeChange = (code) => {
      this.setState({code: code})
    }

    toggleCode = () => {
      console.log("Pressing toggle code")
      this.setState({
        codeIsOpen: !this.state.codeIsOpen
      }, () => {
        console.log(this.state.codeIsOpen)
      })
    }

    renderSpecificContent = (type) => {

      // <Collapse keepChildrenMounted = {true} isOpen={this.state.codeIsOpen}>
      //   <pre>
      //     </pre>
      //   </Collapse>
      //
      const code = this.state.code;
      const options = {
          selectOnLineNumbers: true
      };
      let content;
      if(type === "lambda") {
        content = (<div className="node-code-editor">
                  <Button active = {this.state.codeIsOpen}
                          minimal={true}
                          style={{backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.25)", width: "90%", marginBottom: 5}}
                          onClick = {this.toggleCode}>Edit code</Button>
                    <AceEditor onChange={this.onCodeChange}
                               mode="javascript"
                               theme="terminal"
                               width={"300px"}
                               height={this.state.codeIsOpen ? "150px" : "150px" }
                               setOptions={{
                                enableBasicAutocompletion: true,
                                enableSnippets: true,
                                showLineNumbers: true,
                                tabSize: 2,
                                }}
                               editorProps={{$blockScrolling: false }}/>
                    </div>
                  )
      }
      return content;
    }

    renderParameters = () => {
      let params = this.props.parameters;
      if(params !== undefined) {
        return <ul>
          {params.map(p=>{
            return <li>{p}</li>
          })}
        </ul>
      }
    }

    // {this.props.children}

    render() {
        let {selected} = this.state;

        let nodeClass = 'node' + (
            selected
            ? ' selected'
            : '');

        // <ResizableBox draggableOpts={{}} minConstraints={[100, 100]} maxConstraints={[300, 300]}>
        //   <span>
        // onDoubleClick={(e) => {this.handleClick(e)}}
        // <h2>Parameters</h2>
        // {this.renderParameters()}
        console.log(this.props.parameters)

        return(
            <div onDoubleClick={(e) => {this.handleClick(e)}}>
              <Draggable
                handle=".node-header"
                defaultPosition={{x:this.props.pos.x,y:this.props.pos.y}}
                onStart={(event, ui)=>this.handleDragStart(event, ui)}
                onStop={(event, ui)=>this.handleDragStop(event, ui)}
                onDrag={(event, ui)=>this.handleDrag(event, ui)}>
                <section className={nodeClass} style={{zIndex:10000}}>
                    <header className="node-header">
                      <span className="node-title">{this.props.title}</span>
                    </header>
                    <div className="node-content">
                      <NodeInputList items={this.props.inputs} onCompleteConnector={(index)=>this.onCompleteConnector(index)} />
                      <NodeOuputList items={this.props.outputs} onStartConnector={(index)=>this.onStartConnector(index)} />
                    </div>
                      {this.renderSpecificContent(this.props.type)}
                </section>
              </Draggable>
          </div>

      );
    }
}

export default onClickOutside(Node);
