import React from 'react';
import Header from './Header';
import BoardContainer from './BoardContainer';
import Footer from './Footer';

const App = () => (
  <div className="container">
    <Header />
    <main>
      <BoardContainer />
    </main>
    <Footer />
  </div>
);

export default App;
