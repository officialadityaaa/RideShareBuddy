import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Home from './components/Home';
import Chat from './components/Chat';
import LandingPage from './components/LandingPage';
import BookRide from './components/BookRide';
import ChatWithUser from './components/ChatWithUser'; // Import ChatWithUser component
// import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadScriptComponent from './components/LoadScriptComponent'; // Import the LoadScriptComponent
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  return (
    <>
      <AuthProvider>
        <LoadScriptComponent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Router>
              <div className="app-container">
                <Navbar />
                <ToastContainer position="top-right" autoClose={3000} />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/book-ride" element={<BookRide />} />
                  <Route path="/chat" element={<Chat />} />
                  {/* Route for ChatWithUser */}
                  <Route path="/chat/:userId" element={<ChatWithUser />} />
                </Routes>
                <Footer />
              </div>
            </Router>
          </LocalizationProvider>
        </LoadScriptComponent>
      </AuthProvider>
    </>
  );
}

export default App;
