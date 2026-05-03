import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, ClipboardList, Bell, User } from 'lucide-react';

const Navigation = ({ role }) => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      
      {role === 'retailer' && (
        <NavLink to="/marketplace" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShoppingBag size={24} />
          <span>Shop</span>
        </NavLink>
      )}

      <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <ClipboardList size={24} />
        <span>Orders</span>
      </NavLink>

      <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Bell size={24} />
        <span>Alerts</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={24} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default Navigation;
