import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { Link as LinkIcon, Analytics as AnalyticsIcon } from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import UrlInputForm from './components/UrlInputForm';
import UrlResults from './components/UrlResults';
import UrlStatistics from './components/UrlStatistics';
import { ShortenedUrl } from './types';
import { urlService } from './services/urlService';
import { logger } from './services/logger';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) {
      navigate('/');
    } else {
      navigate('/statistics');
    }
  };

  const getCurrentTab = () => {
    return location.pathname === '/statistics' ? 1 : 0;
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <LinkIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          URL Shortener
        </Typography>
        <Tabs value={getCurrentTab()} onChange={handleTabChange} sx={{ color: 'white' }}>
          <Tab 
            icon={<LinkIcon />} 
            label="Shorten URLs" 
            sx={{ color: 'white' }}
          />
          <Tab 
            icon={<AnalyticsIcon />} 
            label="Statistics" 
            sx={{ color: 'white' }}
          />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
};

const HomePage: React.FC = () => {
  const [recentUrls, setRecentUrls] = useState<ShortenedUrl[]>([]);

  const handleUrlsShortened = (urls: ShortenedUrl[]) => {
    setRecentUrls(urls);
    logger.info('URLs shortened on home page', { count: urls.length });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <UrlInputForm onUrlsShortened={handleUrlsShortened} />
      <UrlResults shortenedUrls={recentUrls} />
    </Container>
  );
};

const StatisticsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <UrlStatistics />
    </Container>
  );
};

const RedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle short URL redirects
    const path = location.pathname.substring(1); // Remove leading slash
    if (path && path !== 'statistics') {
      const shortenedUrl = urlService.getShortenedUrl(path);
      if (shortenedUrl) {
        logger.info('Redirecting to original URL', { 
          shortCode: path, 
          originalUrl: shortenedUrl.originalUrl 
        });
        window.location.href = shortenedUrl.originalUrl;
      } else {
        logger.warn('Short code not found', { shortCode: path });
        navigate('/');
      }
    }
  }, [location.pathname, navigate]);

  return null;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <Navigation />
          <RedirectHandler />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
