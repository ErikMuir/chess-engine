import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import App from './components/App';
import RecoilObserver from './RecoilObserver';

const app = (
  <RecoilRoot>
    <RecoilObserver />
    <App />
  </RecoilRoot>
);

ReactDOM.render(app, document.getElementById('app'));
