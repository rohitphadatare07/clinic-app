import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/patient/new',
      label: 'Add New Patient',
      icon: '➕',
      highlight: true
    },
    {
      path: '/patients',
      label: 'All Patients',
      icon: '👥'
    },
    {
      path: '/medicines', // Add medicines list
      label: 'Medicines Inventory',
      icon: '💊'
    },
    {
      path: '/appointments',
      label: 'Appointments',
      icon: '📅'
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: '📋'
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Quick Actions</h3>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar-item">
              <Link
                to={item.path}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
                {item.highlight && <span className="highlight-badge">New</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

    </aside>
  );
};

export default Sidebar;