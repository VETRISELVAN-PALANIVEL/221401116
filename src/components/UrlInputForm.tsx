import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Alert
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { UrlInput } from '../types';
import { urlService } from '../services/urlService';

interface UrlInputFormProps {
  onUrlsShortened: (urls: any[]) => void;
}

const UrlInputForm: React.FC<UrlInputFormProps> = ({ onUrlsShortened }) => {
  const [urlInputs, setUrlInputs] = useState<UrlInput[]>([
    { originalUrl: '', validityMinutes: 30 }
  ]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  const addUrlInput = () => {
    if (urlInputs.length < 5) {
      setUrlInputs([...urlInputs, { originalUrl: '', validityMinutes: 30 }]);
    }
  };

  const removeUrlInput = (index: number) => {
    if (urlInputs.length > 1) {
      const newInputs = urlInputs.filter((_, i) => i !== index);
      setUrlInputs(newInputs);
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.includes(`_${index}`)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  const updateUrlInput = (index: number, field: keyof UrlInput, value: string | number) => {
    const newInputs = [...urlInputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setUrlInputs(newInputs);
    const newErrors = { ...errors };
    delete newErrors[`${field}_${index}`];
    setErrors(newErrors);
  };

  const validateInputs = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    urlInputs.forEach((input, index) => {
      const validationErrors = urlService.validateUrlInput(input);
      validationErrors.forEach(error => {
        newErrors[`${error.field}_${index}`] = error.message;
        isValid = false;
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setIsSubmitting(true);

    try {
      if (!validateInputs()) {
        setIsSubmitting(false);
        return;
      }

      const results = urlService.shortenMultipleUrls(urlInputs);
      onUrlsShortened(results);
      setUrlInputs([{ originalUrl: '', validityMinutes: 30 }]);
      setErrors({});
    } catch (error) {
      setGeneralError('Failed to shorten URLs. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Shorten URLs
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You can shorten up to 5 URLs at once. Each URL will have a default validity of 30 minutes.
        </Typography>

        {generalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generalError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {urlInputs.map((input, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  label="Original URL"
                  value={input.originalUrl}
                  onChange={(e) => updateUrlInput(index, 'originalUrl', e.target.value)}
                  error={!!errors[`originalUrl_${index}`]}
                  helperText={errors[`originalUrl_${index}`]}
                  placeholder="https://example.com"
                  required
                  sx={{ flexGrow: 1, minWidth: 200 }}
                />
                
                <TextField
                  label="Validity (minutes)"
                  type="number"
                  value={input.validityMinutes || 30}
                  onChange={(e) => updateUrlInput(index, 'validityMinutes', parseInt(e.target.value) || 30)}
                  inputProps={{ min: 1 }}
                  sx={{ width: 150 }}
                />
                
                <TextField
                  label="Custom Code (optional)"
                  value={input.customShortCode || ''}
                  onChange={(e) => updateUrlInput(index, 'customShortCode', e.target.value)}
                  error={!!errors[`customShortCode_${index}`]}
                  helperText={errors[`customShortCode_${index}`]}
                  placeholder="my-link"
                  sx={{ width: 150 }}
                />
                
                {urlInputs.length > 1 && (
                  <IconButton
                    onClick={() => removeUrlInput(index)}
                    color="error"
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
              </Box>
            </Card>
          ))}

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {urlInputs.length < 5 && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addUrlInput}
                disabled={isSubmitting}
              >
                Add Another URL
              </Button>
            )}
            
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ minWidth: 120 }}
            >
              {isSubmitting ? 'Shortening...' : 'Shorten URLs'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UrlInputForm; 