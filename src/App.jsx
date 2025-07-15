import React from 'react';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header title="LookAtni Test" />
      <main>
        <h1>Sistema de Marcadores Únicos</h1>
        <p>Este é um teste do sistema LookAtni!</p>
      </main>
    </div>
  );
}

export default App;