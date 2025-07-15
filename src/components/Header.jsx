import React from 'react';
import './Header.css';

const Header = ({ title }) => {
  return (
    <header className="header">
      <h1>{title}</h1>
      <nav>
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
};

export default Header;