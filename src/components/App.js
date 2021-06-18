import React from 'react';
import Header from './Header';
import Board from './Board';
import Footer from './Footer';

const App = () => (
  <div className="container">
    <Header />
    <main>
      <Board />
    </main>
    <Footer />
  </div>
);

export default App;
