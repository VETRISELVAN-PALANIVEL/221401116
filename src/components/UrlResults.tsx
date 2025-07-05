import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import { ContentCopy as CopyIcon, Launch as LaunchIcon } from '@mui/icons-material';
import { ShortenedUrl } from '../types';
import { logger } from '../services/logger';

interface UrlResultsProps {
  shortenedUrls: ShortenedUrl[];
}

const UrlResults: React.FC<UrlResultsProps> = ({ shortenedUrls }) => {
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

  if (shortenedUrls.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Shortened URLs
        </Typography>
        
        {shortenedUrls.map((url) => (
          <Card key={url.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                  {url.shortUrl}
                </Typography>
                
                <IconButton
                  onClick={() => copyToClipboard(url.shortUrl)}
                  size="small"
                  title="Copy short URL"
                >
                  <CopyIcon />
                </IconButton>
                
                <IconButton
                  onClick={() => window.open(url.originalUrl, '_blank')}
                  size="small"
                  title="Open original URL"
                >
                  <LaunchIcon />
                </IconButton>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Original:</strong> {url.originalUrl}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip 
                  label={`Code: ${url.shortCode}`} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  label={`Validity: ${url.validityMinutes} min`} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  label={`Expires: ${formatTime(url.expiryTime)}`} 
                  size="small" 
                  variant="outlined" 
                />
                {isExpired(url.expiryTime) ? (
                  <Chip 
                    label="Expired" 
                    size="small" 
                    color="error" 
                  />
                ) : (
                  <Chip 
                    label={`${getTimeRemaining(url.expiryTime)} remaining`} 
                    size="small" 
                    color="success" 
                  />
                )}
              </Box>
              
              {isExpired(url.expiryTime) && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  This URL has expired and is no longer accessible.
                </Alert>
              )}
            </Box>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default UrlResults; 