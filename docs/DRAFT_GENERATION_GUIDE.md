# Draft Generation System - Documentation

## Overview

The BetterCall AI Suite now includes an advanced **Draft Generation System** that uses **Retrieval-Augmented Generation (RAG)** with **Pinecone** vector database to generate accurate legal drafts based on your existing templates.

## Features

- 📄 **PDF Processing**: Extract text from PDF drafts and store in vector database
- 🔍 **Semantic Search**: Find similar drafts based on meaning, not just keywords
- 🤖 **AI Generation**: Generate new drafts using GPT-4 with context from existing drafts
- 🎯 **Context-Aware**: Uses RAG to ensure generated drafts match your style and format
- ✨ **Draft Refinement**: Refine and improve existing drafts
- 🔄 **Comparison**: Compare different versions of drafts
- 📊 **Section Extraction**: Automatically extract and categorize draft sections

## Architecture

```
┌─────────────────┐
│   User Request  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Draft Generator │
│   (GPT-4)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ Draft Processor │◄────►│   Pinecone   │
│  (Embeddings)   │      │ Vector Store │
└─────────────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│ Existing Drafts │
│   (PDFs/Text)   │
└─────────────────┘
```

## Setup Instructions

### 1. Install Dependencies

All required packages are already in `package.json`. Run:

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your API keys:

```bash
# Required for Draft Generation
PINECONE_API_KEY=your_pinecone_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

**Get API Keys:**
- **Pinecone**: https://www.pinecone.io/ (Free tier available)
- **OpenAI**: https://platform.openai.com/api-keys (Requires billing setup)

### 3. Add Your Draft PDFs

Place your PDF draft templates in the `backend/drafts` folder:

```
backend/
  drafts/
    rental-agreement.pdf
    sale-deed.pdf
    power-of-attorney.pdf
    legal-notice.pdf
    ... (add all your draft PDFs here)
```

### 4. Process Your Drafts

Run the processing script to extract text and upload to Pinecone:

```bash
npm run process-drafts
```

This will:
- Read all PDFs from the `drafts` folder
- Extract text from each PDF
- Split text into chunks with overlap
- Generate embeddings using OpenAI
- Store vectors in Pinecone

### 5. Test the System

```bash
npm run test-drafts
```

This will test:
- Searching for similar drafts
- Generating a new draft based on a prompt
- Displaying references and suggestions

## API Endpoints

### 1. Generate Draft

```http
POST /api/drafts/generate
Content-Type: application/json

{
  "prompt": "Create a rental agreement for a residential property in Mumbai. Landlord: Mr. Sharma, Tenant: Ms. Patel, Rent: Rs. 25,000/month",
  "draftType": "agreement",
  "additionalContext": {
    "parties": ["Mr. Sharma", "Ms. Patel"],
    "court": "Mumbai District Court",
    "tone": "formal",
    "specificClauses": [
      "Maintenance responsibilities",
      "Termination conditions"
    ]
  }
}
```

**Response:**
```json
{
  "id": "draft-1234567890",
  "draft": "RENTAL AGREEMENT\n\nThis Agreement is made on...",
  "metadata": {
    "generatedAt": "2025-11-01T10:30:00Z",
    "model": "gpt-4-turbo-preview",
    "tokensUsed": 1500,
    "processingTime": "3.5s"
  },
  "references": [
    {
      "filename": "rental-agreement.pdf",
      "relevanceScore": 0.89,
      "sections": ["..."]
    }
  ],
  "suggestions": [
    "Review all party names for accuracy",
    "Verify statutory references"
  ]
}
```

### 2. Upload New PDF Draft

```http
POST /api/drafts/upload-pdf
Content-Type: multipart/form-data

file: [PDF file]
metadata: {"draftType": "agreement", "category": "rental"}
```

### 3. Search Similar Drafts

```http
GET /api/drafts/search?q=rental%20agreement&topK=5
```

### 4. Refine Draft

```http
POST /api/drafts/refine
Content-Type: application/json

{
  "originalDraft": "...",
  "refinementInstructions": "Make the language more formal and add a clause about pets"
}
```

### 5. Compare Drafts

```http
POST /api/drafts/compare
Content-Type: application/json

{
  "draft1": "...",
  "draft2": "..."
}
```

### 6. Extract Sections

```http
POST /api/drafts/extract-sections
Content-Type: application/json

{
  "draft": "..."
}
```

### 7. Get Statistics

```http
GET /api/drafts/stats
```

## Usage Examples

### Example 1: Generate a Legal Notice

```javascript
const response = await fetch('http://localhost:3000/api/drafts/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Draft a legal notice to a tenant for non-payment of rent for 3 months. Amount due: Rs. 75,000. Give 15 days notice.',
    draftType: 'notice',
    additionalContext: {
      tone: 'formal',
      parties: ['Landlord: Mr. Kumar', 'Tenant: Mr. Singh']
    }
  })
});

const result = await response.json();
console.log(result.draft);
```

### Example 2: Search for Similar Drafts

```javascript
const response = await fetch('http://localhost:3000/api/drafts/search?q=employment%20contract&topK=5');
const results = await response.json();

results.results.forEach(draft => {
  console.log(`${draft.filename} - Relevance: ${draft.score}`);
  console.log(draft.text.substring(0, 200));
});
```

## Best Practices

### 1. Organizing Your Drafts

- Use descriptive filenames: `residential-rental-agreement.pdf`
- Group similar types together
- Keep drafts updated and accurate

### 2. Writing Effective Prompts

✅ **Good Prompt:**
```
Create a sale deed for agricultural land in Pune. Seller: Mr. Patil, 
Buyer: Ms. Desai, Area: 2 acres, Price: Rs. 50 lakhs. Include clauses 
for water rights and boundary demarcation.
```

❌ **Poor Prompt:**
```
Make a sale deed
```

### 3. Using Additional Context

Always provide:
- **Parties**: Full names and roles
- **Specific details**: Amounts, dates, locations
- **Special clauses**: Unique requirements
- **Tone**: formal, persuasive, or neutral

### 4. Metadata for Uploaded PDFs

When uploading drafts, include metadata:
```json
{
  "draftType": "agreement|notice|petition|affidavit",
  "category": "rental|employment|sale|purchase",
  "tags": ["residential", "commercial", "urgent"]
}
```

## Draft Types Supported

- **Agreements**: Rental, Employment, Sale, Purchase, Partnership
- **Notices**: Legal Notice, Eviction Notice, Demand Notice
- **Petitions**: Writ Petition, Civil Petition, Criminal Petition
- **Affidavits**: General Affidavit, Income Affidavit, Identity Affidavit
- **Applications**: Bail Application, Leave Application
- **Deeds**: Sale Deed, Gift Deed, Trust Deed

## Troubleshooting

### Issue: "Draft processor not initialized"

**Solution:** Ensure environment variables are set and run:
```bash
npm run process-drafts
```

### Issue: "No similar drafts found"

**Solutions:**
1. Check if PDFs were processed: `GET /api/drafts/stats`
2. Ensure drafts folder has PDFs
3. Re-run: `npm run process-drafts`

### Issue: "OpenAI API rate limit"

**Solutions:**
1. Wait a few seconds between requests
2. Consider upgrading OpenAI plan
3. Use lower `maxTokens` in options

### Issue: "Pinecone index not ready"

**Solution:** Wait 30-60 seconds after index creation, then retry

## Cost Estimation

### OpenAI Costs (GPT-4)
- Embedding generation: ~$0.0001 per 1K tokens
- Draft generation: ~$0.03-0.06 per request
- Average document: ~500-1000 tokens

### Pinecone Costs
- Free tier: 1 index, 10K vectors
- Starter: $70/month for 100K vectors
- Each draft chunk: 1 vector

### Example:
- 100 PDFs × 10 chunks each = 1,000 vectors ✅ Free tier
- 50 draft generations/day = ~$1.50-3.00/day

## Security Considerations

1. **API Keys**: Never commit `.env` to git
2. **Access Control**: Add authentication to endpoints
3. **Rate Limiting**: Implement in production
4. **Input Validation**: Always validate user prompts
5. **Data Privacy**: Be cautious with sensitive legal documents

## Performance Tips

1. **Batch Processing**: Process multiple PDFs together
2. **Caching**: Cache frequently used embeddings
3. **Chunk Size**: Adjust based on document structure
4. **Model Selection**: Use GPT-3.5 for faster, cheaper responses

## Integration with Frontend

Create a React component:

```typescript
import { useState } from 'react';

export function DraftGenerator() {
  const [prompt, setPrompt] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  const generateDraft = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/drafts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, draftType: 'agreement' })
      });
      const result = await response.json();
      setDraft(result.draft);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the draft you need..."
      />
      <button onClick={generateDraft} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Draft'}
      </button>
      {draft && <pre>{draft}</pre>}
    </div>
  );
}
```

## Next Steps

1. ✅ Set up environment variables
2. ✅ Add your PDF drafts
3. ✅ Run `npm run process-drafts`
4. ✅ Test with `npm run test-drafts`
5. 🚀 Integrate with your frontend
6. 📊 Monitor usage and costs
7. 🔄 Regularly update draft templates

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoint documentation
3. Test with the provided scripts
4. Check server logs for errors

## License

Part of BetterCall AI Suite - Legal Document Analysis System
