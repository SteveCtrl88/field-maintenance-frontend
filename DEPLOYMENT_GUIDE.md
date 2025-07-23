# Field Maintenance App Deployment Guide

## Prerequisites

- Node.js 18+ and pnpm
- Python 3.8+ (for PDF backend)
- Firebase project with Storage and Realtime Database enabled
- HTTPS-enabled hosting for camera functionality

## Frontend Deployment

### 1. Install Dependencies
```bash
cd integrated-project
pnpm install
```

### 2. Build for Production
```bash
pnpm build
```

### 3. Deploy Static Files
Deploy the contents of the `dist/` folder to your hosting service:
- Vercel: `vercel deploy`
- Netlify: Drag and drop `dist/` folder
- AWS S3: Upload `dist/` contents to S3 bucket
- Any static hosting service

### 4. Environment Configuration
Ensure the following environment variables are set:
- Firebase configuration is already included in the code
- `VITE_PDF_SERVICE_URL` - base URL of the PDF service used by `pdfService.js`

## PDF Backend Deployment

### 1. Navigate to Backend Directory
```bash
cd pdf-backend
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Deploy to Hosting Service

#### Option A: Heroku
```bash
# Create Heroku app
heroku create your-pdf-service-name

# Deploy
git add .
git commit -m "Deploy PDF service"
git push heroku main
```

#### Option B: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

#### Option C: DigitalOcean App Platform
1. Connect your repository
2. Select the `pdf-backend` folder
3. Configure Python environment
4. Deploy

### 4. Update Frontend Configuration
After deploying the PDF backend, update the service URL in:
```javascript
// src/services/pdfService.js
const PDF_SERVICE_URL = 'https://your-pdf-service-url.com/api/reports';
```

## Firebase Configuration

### 1. Enable Required Services
In your Firebase console:
- Enable Authentication (Email/Password)
- Enable Realtime Database
- Enable Storage

### 2. Set Security Rules

#### Realtime Database Rules
```json
{
  "rules": {
    "inspections": {
      "$inspectionId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /inspections/{inspectionId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Create Test Users
Add test users in Firebase Authentication for testing:
- Email: `test@example.com`
- Password: `password123`

## Production Considerations

### 1. HTTPS Requirement
Camera functionality requires HTTPS. Ensure your hosting service provides SSL certificates:
- Vercel: Automatic HTTPS
- Netlify: Automatic HTTPS
- Custom domains: Use Let's Encrypt or CloudFlare

### 2. CORS Configuration
If PDF backend is on different domain, configure CORS:
```python
# In your Flask app
from flask_cors import CORS
CORS(app, origins=['https://your-frontend-domain.com'])
```

### 3. Environment Variables
Set production environment variables:
- `FLASK_ENV=production`
- `SECRET_KEY=your-secret-key`
- Any API keys for email service

### 4. Error Monitoring
Consider adding error monitoring:
- Sentry for frontend errors
- Application monitoring for backend
- Firebase Analytics for usage tracking

## Testing Deployment

### 1. Frontend Testing
1. Access your deployed URL
2. Test login functionality
3. Navigate through the application
4. Verify all components load correctly

### 2. Camera Testing
1. Access the app on a mobile device or laptop with camera
2. Start a maintenance session
3. Test camera functionality on questions that require images
4. Verify images upload to Firebase Storage

### 3. PDF Testing
1. Complete a maintenance session
2. Go to completion screen
3. Test PDF download functionality
4. Verify PDF contains all inspection data

### 4. Firebase Testing
1. Check Firebase Console for uploaded images
2. Verify inspection data in Realtime Database
3. Test data persistence across sessions

## Troubleshooting

### Common Issues

#### Camera Not Working
- Ensure HTTPS is enabled
- Check browser permissions for camera access
- Test on different devices/browsers

#### PDF Generation Fails
- Verify PDF backend service is running
- Check service URL in frontend configuration
- Review backend logs for errors

#### Firebase Connection Issues
- Verify Firebase configuration
- Check security rules
- Ensure services are enabled in Firebase Console

#### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Check for TypeScript errors
- Verify all imports are correct

### Debug Commands

#### Check Frontend Build
```bash
pnpm build
pnpm preview  # Test production build locally
```

#### Test PDF Backend Locally
```bash
cd pdf-backend
python src/main.py
# Test at http://localhost:5000/api/reports/health
```

#### Check Firebase Connection
Open browser console and look for Firebase initialization messages.

## Monitoring and Maintenance

### 1. Regular Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Update Firebase SDK regularly

### 2. Backup Strategy
- Firebase data is automatically backed up
- Consider exporting inspection data regularly
- Backup uploaded images from Firebase Storage

### 3. Performance Monitoring
- Monitor page load times
- Track camera functionality usage
- Monitor PDF generation success rates

## Support

For deployment issues:
1. Check browser console for errors
2. Review server logs for backend issues
3. Verify Firebase configuration and permissions
4. Test individual components in isolation

---

**Last Updated:** July 22, 2025
**Version:** 1.0.0

