// components/Shared/Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/images/clinic_manager.jpg';

const Navbar = ({ onLogout, user }) => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <img 
              src={logo} 
              alt="Clinic Logo" 
              className="navbar-logo"
          />
          <span className="navbar-title">Clinic Manager</span>
        </Link>
        
        <div className="navbar-menu">
          <div className="navbar-user">
            <span className="user-greeting">
              Welcome, {user?.name}
            </span>
            <button
              onClick={onLogout}
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;