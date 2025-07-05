import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button
} from '@mui/material';
import { ContentCopy as CopyIcon, Launch as LaunchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { ShortenedUrl } from '../types';
import { urlService } from '../services/urlService';
import { logger } from '../services/logger';

const UrlStatistics: React.FC = () => {
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUrls = () => {
    setLoading(true);
    try {
      // Clear expired URLs first
      urlService.clearExpiredUrls();
      
      // Get all valid URLs
      const urls = urlService.getAllShortenedUrls();
      setShortenedUrls(urls);
      
      logger.info('Loaded URL statistics', { count: urls.length });
    } catch (error) {
      logger.error('Failed to load URL statistics', { error });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUrls();
    
    // Refresh every minute to update expiry times
    const interval = setInterval(loadUrls, 60000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.info('URL copied to clipboard', { url: text });
    } catch (error) {
      logger.error('Failed to copy URL to clipboard', { error });
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleString();
  };

  const getTimeRemaining = (expiryTime: Date): string => {
    const now = new Date();
    const diff = expiryTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Expired';
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  const isExpired = (expiryTime: Date): boolean => {
    return new Date() > expiryTime;
  };

  const getValidUrls = (): ShortenedUrl[] => {
    return shortenedUrls.filter(url => !isExpired(url.expiryTime));
  };

  const getExpiredUrls = (): ShortenedUrl[] => {
    return shortenedUrls.filter(url => isExpired(url.expiryTime));
  };

  const validUrls = getValidUrls();
  const expiredUrls = getExpiredUrls();

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              URL Statistics
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadUrls}
              disabled={loading}
              variant="outlined"
            >
              Refresh
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <Chip 
              label={`Total: ${shortenedUrls.length}`} 
              color="primary" 
            />
            <Chip 
              label={`Active: ${validUrls.length}`} 
              color="success" 
            />
            <Chip 
              label={`Expired: ${expiredUrls.length}`} 
              color="error" 
            />
          </Box>

          {shortenedUrls.length === 0 ? (
            <Alert severity="info">
              No shortened URLs found. Create some URLs first!
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Short URL</TableCell>
                    <TableCell>Original URL</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Validity</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shortenedUrls.map((url) => (
                    <TableRow key={url.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {url.shortUrl}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={url.originalUrl}
                        >
                          {url.originalUrl}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={url.shortCode} 
                          size="small" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        {url.validityMinutes} min
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatTime(url.expiryTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {isExpired(url.expiryTime) ? (
                          <Chip 
                            label="Expired" 
                            size="small" 
                            color="error" 
                          />
                        ) : (
                          <Chip 
                            label={`${getTimeRemaining(url.expiryTime)} left`} 
                            size="small" 
                            color="success" 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            onClick={() => copyToClipboard(url.shortUrl)}
                            size="small"
                            title="Copy short URL"
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => window.open(url.originalUrl, '_blank')}
                            size="small"
                            title="Open original URL"
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UrlStatistics; 