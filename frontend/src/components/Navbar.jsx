/* eslint-disable no-unused-vars */
// src/components/Navbar.jsx
import { useEffect, useState, useContext } from 'react'; // Ensure useContext is imported
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext'; // Ensure the path is correct

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useContext(AuthContext); // Ensure useContext is used correctly
  const { setIsAuthenticated } = useContext(AuthContext); // Use the AuthContext

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    axios.get('http://localhost:5000/api/register/user', { withCredentials: true })
      .then(res => {
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
      });
  };

  const handleLogout = () => {
    axios.post('http://localhost:5000/api/register/logout', {}, { withCredentials: true })
      .then(() => {
        setUser(null);
        toast.success('Logged out successfully!');
        setIsAuthenticated(false); 
        navigate('/');
      })
      .catch(err => {
        console.error('Logout error:', err);
        toast.error('Error logging out. Please try again.');
      });
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Add this function to force a re-fetch of user data
  const refreshUserData = () => {
    fetchUserData();
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" onClick={closeMenu}>
          <div className='imgg'>
            <img src="/ride.jpg" alt="RideShareBuddy Logo" className="logo-image" />
          </div>
          <span className="logo-text">
            <span>R</span>ide<span className="share">Share-</span><span>B</span>uddy
          </span>
        </Link>
      </div>
      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        {isAuthenticated ? (
          <>
            <li><Link to="/dashboard" onClick={closeMenu}>Dashboard</Link></li>
            <li><Link to="/profile" onClick={closeMenu}>Profile</Link></li>
            <li><Link to="/chat" onClick={closeMenu}>Chat</Link></li>
            <li>
              <button
                onClick={() => { handleLogout(); closeMenu(); }}
                className="nav-button"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/register" onClick={closeMenu}>
                <button className="nav-button">Register</button>
              </Link>
            </li>
            <li>
              <Link to="/login" onClick={() => { closeMenu(); refreshUserData(); }}>
                <button className="nav-button">Login</button>
              </Link>
            </li>
          </>
        )}
      </ul>
      {/* Hamburger Menu */}
      <div className="hamburger" onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </nav>
  );
}

export default Navbar;
