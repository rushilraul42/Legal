# Quick Setup Guide - Draft Generation System

## Prerequisites
- Node.js 18+ installed
- Pinecone account (free tier available)
- Google Gemini API key (free tier available)

## Setup Steps

### 1. Get API Keys

#### Pinecone
1. Go to https://www.pinecone.io/
2. Sign up for free account
3. Create a new project
4. Copy your API key from the dashboard

#### Google Gemini
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Free tier includes generous limits!

### 2. Configure Environment

Your `backend/.env` should already have:

```bash
# Keys should already be configured
PINECONE_API_KEY=your_actual_pinecone_key_here
GEMINI_API_KEY=your_actual_gemini_key_here
# or
VITE_GOOGLE_AI_API_KEY=your_actual_gemini_key_here
```

### 3. Add Your Draft PDFs

```bash
# Place all your draft PDFs in this folder
backend/drafts/
```

Example structure:
```
backend/drafts/
├── rental-agreement-sample1.pdf
├── rental-agreement-sample2.pdf
├── employment-contract.pdf
├── sale-deed-template.pdf
├── legal-notice-template.pdf
└── power-of-attorney.pdf
```

### 4. Install and Process

```bash
# Install dependencies (if not already done)
cd backend
npm install

# Process all PDFs and upload to Pinecone
npm run process-drafts
```

Expected output:
```
🚀 Starting draft processing...
📡 Initializing draft processor...
✅ Draft processor initialized
📁 Processing PDFs from: /path/to/backend/drafts

Processing rental-agreement-sample1.pdf...
Successfully processed rental-agreement-sample1.pdf
Processing employment-contract.pdf...
Successfully processed employment-contract.pdf
...
Successfully processed 6 files
```

### 5. Test the System

```bash
npm run test-drafts
```

This will:
- Search for similar drafts
- Generate a sample draft
- Display results

### 6. Start the Server

```bash
npm run dev
```

Server should start on http://localhost:3000

### 7. Test API Endpoints

Using curl or Postman:

```bash
# Health check
curl http://localhost:3000/api/health

# Search drafts
curl "http://localhost:3000/api/drafts/search?q=rental%20agreement"

# Generate draft
curl -X POST http://localhost:3000/api/drafts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a rental agreement for Mumbai property",
    "draftType": "agreement"
  }'
```

## Verification Checklist

- [ ] API keys configured in .env
- [ ] PDF drafts placed in backend/drafts folder
- [ ] `npm install` completed successfully
- [ ] `npm run process-drafts` executed without errors
- [ ] Server starts without errors
- [ ] Can search drafts via API
- [ ] Can generate new drafts via API

## Common Issues

### "PINECONE_API_KEY is not set"
- Check .env file exists in backend folder
- Verify key is correctly copied without extra spaces
- Restart the server after adding keys

### "Error creating Pinecone index"
- Ensure you're using a valid Pinecone account
- Free tier allows 1 index - delete old indexes if needed
- Wait 30-60 seconds for index to become ready

### "OpenAI rate limit exceeded"
- Check your OpenAI usage limits
- Wait a few minutes before retrying
- Consider upgrading your OpenAI plan

### "No PDFs found in drafts folder"
- Verify PDFs are in backend/drafts folder
- Check file extensions are .pdf (lowercase)
- Ensure PDFs are not corrupted

## Next Steps

1. Add more draft templates to improve quality
2. Integrate with frontend UI
3. Customize draft types for your use case
4. Monitor API usage and costs

## Need Help?

- Full documentation: `docs/DRAFT_GENERATION_GUIDE.md`
- API reference: See "API Endpoints" section in guide
- Backend logs: Check console output for errors

## Production Deployment

Before deploying to production:

1. Set `NODE_ENV=production` in .env
2. Add authentication to API endpoints
3. Implement rate limiting
4. Set up monitoring for API costs
5. Use environment-specific API keys
6. Configure CORS appropriately
7. Set up backup for Pinecone data

---

Ready to generate legal drafts! 🚀⚖️
