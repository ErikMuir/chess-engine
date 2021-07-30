import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './styles/app.css';
import './styles/canvas.css';
import './styles/modal.css';

process.env.LOG_LEVEL = 'info';

ReactDOM.render(<App />, document.getElementById('app'));
