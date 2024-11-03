import { useState, useContext } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LocationForm from './LocationForm';
import MapVisualization from './MapVisualization';
import { toast } from 'react-toastify';
import SendIcon from "@mui/icons-material/Send";
import PeopleIcon from "@mui/icons-material/People";

const BookRide = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [initialLocation, setInitialLocation] = useState(null);
  const [finalLocation, setFinalLocation] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(dayjs());
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchedRides, setMatchedRides] = useState([]);

  const handleUpdateLocation = (location, type) => {
    if (type === 'initial') {
      setInitialLocation(location);
    } else if (type === 'final') {
      setFinalLocation(location);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      toast.error('You must be logged in to book a ride.');
      navigate('/login');
      return;
    }

    if (!initialLocation || !finalLocation || !selectedDateTime) {
      toast.error('Please fill in all fields.');
      return;
    }

    const payload = {
      name: sessionStorage.getItem('userName') || "",
      email: sessionStorage.getItem('userEmail') || "",
      initialLocation,
      finalLocation,
      startTime: new Date(selectedDateTime).toISOString(),
    };

    try {
      const response = await fetch('http://localhost:5000/api/users/submit-ride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
        
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      toast.success('Ride booked successfully!');
    } catch (error) {
      console.error('Error during submission:', error.message);
      toast.error('Failed to submit ride: ' + error.message);
    }
  };

  const handleFindMatches = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to find matches.');
      return;
    }

    if (!initialLocation || !finalLocation || !selectedDateTime) {
      toast.error('Please fill in all fields to find matches.');
      return;
    }

    setLoadingMatches(true);
    const payload = {
      initialLocation2: initialLocation,
      finalLocation2: finalLocation,
      startTime2: new Date(selectedDateTime).toISOString(),
    };

    try {
      const response = await fetch('http://localhost:5000/api/rides/find-matching-rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include', // Add this line to include credentials
      });
    
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setMatchedRides(data);
      
      if (data.length > 0) {
        toast.success('Matched rides fetched successfully!');
      } else {
        toast.info('No matched rides found.');
      }
    } catch (error) {
      console.error('Error fetching matched rides:', error.message);
      toast.error('Failed to fetch matched rides: ' + error.message);
    } finally {
      setLoadingMatches(false);
    }
    
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 4, backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#ffffff' }}>
        <Typography variant="h4" align="center" gutterBottom color="#20c997">
          Book Your Ride
        </Typography>
        <Grid container spacing={4}>
          {/* Form Section */}
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSubmit}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <LocationForm onUpdateLocation={handleUpdateLocation} />
                  <DateTimePicker
                    label="Select Date & Time"
                    value={selectedDateTime}
                    onChange={(newValue) => setSelectedDateTime(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    disablePast
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    Submit Ride
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleFindMatches}
                    sx={{ alignSelf: 'flex-end', marginTop: 2 }}
                    disabled={loadingMatches}
                    startIcon={<PeopleIcon />}
                  >
                    {loadingMatches ? <CircularProgress size={24} color="inherit" /> : 'Find Matched Rides'}
                  </Button>
                </Box>
              </LocalizationProvider>
            </form>
          </Grid>

          {/* Map Section */}
          <Grid item xs={12} md={6}>
            {initialLocation && finalLocation && (
              <MapVisualization
                start={initialLocation}
                end={finalLocation}
                matchedRides={matchedRides} // Pass matched rides for visualization
              />
            )}
          </Grid>
        </Grid>

        {/* Display Matched Rides */}
        {matchedRides.length > 0 && (
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h5" align="center" gutterBottom color="#1976d2">
              Matched Rides
            </Typography>
            <Grid container spacing={3}>
              {matchedRides.map((ride, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: '#20c997' }}>
                          {ride.name.charAt(0).toUpperCase()}
                        </Avatar>
                      }
                      title={ride.name}
                      subheader={ride.email}
                    />
                    <Divider />
                    <CardContent>
                      <Typography variant="body1" color="textSecondary" gutterBottom>
                        <strong>From:</strong> {ride.initialLocation.name || `${ride.initialLocation.lat}, ${ride.initialLocation.lng}`}
                      </Typography>
                      <Typography variant="body1" color="textSecondary" gutterBottom>
                        <strong>To:</strong> {ride.finalLocation.name || `${ride.finalLocation.lat}, ${ride.finalLocation.lng}`}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Start Time:</strong> {new Date(ride.startTime).toLocaleString()}
                      </Typography>
                      {/* Link to chat with the user */}
                      <Button
                        component={Link}
                        to={`/chat/${ride.userId}`} // Ensure ride object has userId field
                        variant="outlined"
                        color="primary"
                        sx={{ marginTop: 2 }}
                      >
                        View Profile & Chat
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default BookRide;
