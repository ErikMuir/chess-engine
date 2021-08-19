import React from 'react';
import Modal from 'react-modal';
import Header from './Header';
import Board from './Board';
import Footer from './Footer';

Modal.setAppElement('#app');

const App = () => (
  <div className="app-container">
    <Header />
    <Board />
    <Footer />
  </div>
);

export default App;
