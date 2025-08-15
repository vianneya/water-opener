# Water Opener - Barcode Bottle Tracker

A simple web app to track water bottle consumption by scanning UPC barcodes. Each physical bottle gets a unique ID and logs who opened it when.

## Features

- 📱 Mobile-friendly barcode scanning with camera
- 🔢 Auto-incrementing bottle IDs (UPC-1, UPC-2, etc.)
- 👥 Track who opened which bottle
- 📊 View last opened bottles overall and per person
- ☁️ Google Sheets backend for data storage
- 🚀 Single-file deployment ready for Netlify

## Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Sheet
2. Rename the sheet tab to **"Log"** (case-sensitive)
3. Add the following header row (A1-F1):
   ```
   timestamp | upc | bottle_id | person | note | device
   ```

### 2. Google Apps Script Setup

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete all existing code in the editor
3. Copy and paste the entire content of `apps-script.js` into the editor
4. Save the project (Ctrl/Cmd + S)
5. Click **Deploy → New Deployment**
6. Choose:
   - **Type**: Web app
   - **Execute as**: Me (your@email.com)
   - **Who has access**: Anyone (or "Anyone with Google account" for more security)
7. Click **Deploy**
8. **Copy the Web app URL** - you'll need this for the frontend

### 3. Frontend Configuration

1. Open `index.html` in a text editor
2. Find the line: `const APPS_SCRIPT_URL = 'APPS_SCRIPT_URL_HERE';`
3. Replace `'APPS_SCRIPT_URL_HERE'` with your Apps Script Web app URL
4. Save the file

### 4. Netlify Deployment

#### Option A: Drag & Drop (Easiest)
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Drag the `index.html` file directly onto the Netlify dashboard
3. Your app will be live instantly with HTTPS enabled

#### Option B: Git Repository
1. Push your files to a GitHub repository
2. Connect the repository to Netlify
3. Deploy automatically

## Usage

1. Open the Netlify URL on your phone
2. Tap **"Start Scanner"** 
3. Point camera at a bottle's UPC barcode
4. Enter your name
5. The app auto-suggests the next bottle number for that UPC
6. Add an optional note (e.g., location)
7. Tap **"Log as Opened"**
8. View summaries of recent activity

## API Endpoints

Your Apps Script provides these endpoints:

- `GET ?action=health` - Health check
- `GET ?action=last` - Last opened bottle
- `GET ?action=lastPerPerson` - Last bottle per person
- `GET ?action=today` - All bottles opened today
- `GET ?action=nextIndex&upc=XXX` - Next number for UPC
- `POST` with JSON body - Log new bottle opening

## Data Format

Each bottle log contains:
- **timestamp**: When opened (ISO 8601)
- **upc**: Barcode digits only
- **bottle_id**: Unique ID like "041508000519-3"
- **person**: Name of person who opened it
- **note**: Optional note
- **device**: User agent string

## Troubleshooting

### Camera not working
- Ensure you're accessing via HTTPS (Netlify provides this automatically)
- Grant camera permissions when prompted
- Try using Chrome/Safari on mobile

### Apps Script errors
- Check that the Google Sheet has a tab named "Log" (case-sensitive)
- Verify the header row matches exactly: `timestamp, upc, bottle_id, person, note, device`
- Redeploy the Apps Script if you made changes

### CORS errors
- The Apps Script includes proper CORS headers
- Make sure you're using the Web app URL, not the script URL

## Files

- `index.html` - Complete web app (frontend)
- `apps-script.js` - Google Apps Script backend code
- `README.md` - This setup guide

## Example Data

```
2025-01-15T14:11:05Z | 041508000519 | 041508000519-1 | Vianney | kitchen counter | iPhone Safari
2025-01-15T14:15:22Z | 041508000519 | 041508000519-2 | Alice   |                 | Android Chrome
```

## Technology Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript with ZXing barcode library
- **Backend**: Google Apps Script (serverless JavaScript)
- **Database**: Google Sheets
- **Hosting**: Netlify
- **Camera**: WebRTC getUserMedia API 