import React, { Component, createRef } from 'react';
import Canvas from './Canvas';

export default class CanvasContainer extends Component {
  constructor(props) {
    super(props);
    this.myRef = createRef();
  }

  render() {
    const {
      className, canvasId, draw, width, height,
    } = this.props;

    let classNames = 'canvas-container';
    if (className) classNames += ` ${className}`;

    return (
      <div
        ref={this.myRef}
        className={classNames}
        style={{ width, height }}
      >
        <Canvas draw={draw} canvasId={canvasId} />
      </div>
    );
  }
}
