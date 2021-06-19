import React, { Component, createRef } from 'react';
import Canvas from './Canvas';

export default class CanvasContainer extends Component {
  constructor(props) {
    super(props);
    this.myRef = createRef();
    this.state = {
      width: 0,
      height: 0,
    };
  }

  componentDidMount() {
    const { devicePixelRatio: ratio = 1 } = window;
    this.setState({
      width: this.myRef.current.clientWidth * ratio,
      height: this.myRef.current.clientHeight * ratio,
    });
  }

  render() {
    const { className, draw, onClick } = this.props;
    const { width, height } = this.state;
    return (
      <div ref={this.myRef} className={`canvas-container ${className}`}>
        <Canvas draw={draw} onClick={onClick} width={width} height={height} />
      </div>
    );
  }
}
