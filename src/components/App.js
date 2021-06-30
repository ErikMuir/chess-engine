import React from 'react';
import Header from './Header';
import BoardGUI from './BoardGUI';
import Footer from './Footer';

const App = () => (
  <div className="container">
    <Header />
    <main>
      <BoardGUI />
    </main>
    <Footer />
  </div>
);

export default App;
