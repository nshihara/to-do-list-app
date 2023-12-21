import React from 'react';
import './header.css'; 

const Header: React.FC = () => {
  return (
    <header className="app-header">
       <div className="left">
        <span className="title-text">The To Do List</span>
      </div>
      <div className="right">
        <nav>          
            <div>
            <a href="/" className="home-button">Home</a>
            </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
