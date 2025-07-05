# URL Shortener

A modern React TypeScript application for shortening URLs with Material UI design.

## Features

- **URL Shortening**: Shorten up to 5 URLs at once
- **Custom Shortcodes**: Optional custom shortcodes for URLs
- **Validity Period**: Set custom validity periods (default: 30 minutes)
- **Statistics Page**: View all shortened URLs with detailed information
- **Client-side Routing**: Automatic redirection from short URLs to original URLs
- **Real-time Updates**: Live expiry time tracking
- **Copy to Clipboard**: Easy copying of shortened URLs
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **React 19** with TypeScript
- **Material UI** for UI components
- **React Router** for navigation
- **Client-side storage** for URL persistence

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd url-shortener
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Usage

### Shortening URLs

1. Navigate to the home page
2. Enter up to 5 URLs you want to shorten
3. Optionally set:
   - **Validity period** (in minutes, default: 30)
   - **Custom shortcode** (3-20 characters, alphanumeric and hyphens only)
4. Click "Shorten URLs" to generate short links

### Viewing Statistics

1. Click on the "Statistics" tab in the navigation
2. View all shortened URLs with:
   - Original and shortened URLs
   - Custom shortcodes
   - Validity periods
   - Expiry times
   - Current status (active/expired)

### Using Short URLs

- Short URLs are in the format: `http://localhost:3000/{shortcode}`
- Clicking a short URL will redirect to the original URL
- Expired URLs will show an error message

## Features in Detail

### URL Validation
- Validates URL format before shortening
- Ensures custom shortcodes are unique and valid
- Validates validity periods as positive integers

### Short Link Uniqueness
- All generated short links are guaranteed to be unique
- Custom shortcodes are validated for uniqueness
- Auto-generated codes use a 6-character alphanumeric format

### Default Validity
- If no validity period is specified, defaults to 30 minutes
- All validity periods are stored as integer minutes
- Expired URLs are automatically filtered out

### Error Handling
- User-friendly error messages for validation failures
- Graceful handling of expired URLs
- Clear feedback for all user actions

### Logging
- Comprehensive logging middleware for all operations
- Tracks URL creation, access, and errors
- Development mode console logging

## Project Structure

```
src/
├── components/
│   ├── UrlInputForm.tsx    # Form for shortening URLs
│   ├── UrlResults.tsx      # Display shortened URL results
│   └── UrlStatistics.tsx   # Statistics page component
├── services/
│   ├── logger.ts           # Logging middleware
│   └── urlService.ts       # URL shortening logic
├── types/
│   └── index.ts            # TypeScript type definitions
├── App.tsx                 # Main application component
└── index.tsx               # Application entry point
```

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Code Style

- TypeScript for type safety
- Material UI components for consistent design
- Functional components with hooks
- Comprehensive error handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License.
