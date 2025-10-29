# Legal Judgment Database - Implementation Guide

## ⚖️ LEGAL vs ILLEGAL Approaches

### ❌ ILLEGAL (Don't Do This)
- Scraping India Kanoon website
- Bypassing their API rate limits
- Storing their proprietary data
- Violating their Terms of Service

### ✅ LEGAL (Recommended)
- Use official government sources (FREE!)
- eCourts India API
- Supreme Court official downloads
- High Court public websites
- National Judicial Data Grid

---

## 🏛️ Official Free Legal Sources

### 1. **eCourts India** (Best Option)
- **Website**: https://services.ecourts.gov.in/
- **API**: Yes (Free after registration)
- **Coverage**: All district courts, tribunals
- **Data**: Case status, orders, judgments
- **Format**: JSON API
- **Registration**: Simple online form

**API Endpoints:**
```
- Case Status by CNR
- Search by Party Name
- Case History
- Cause List
- Daily Orders
```

### 2. **Supreme Court of India**
- **Website**: https://main.sci.gov.in/
- **Bulk Downloads**: Available
- **Coverage**: All SC judgments since 1950
- **Data**: ~35,000 new judgments/year
- **Format**: PDF
- **Cost**: FREE

**Available Data:**
```
- Judgment PDFs
- Case status
- Cause lists
- Historical archives
```

### 3. **National Judicial Data Grid (NJDG)**
- **Website**: https://njdg.ecourts.gov.in/
- **Data**: Judicial statistics, pending cases
- **API**: Public dashboard
- **Cost**: FREE

### 4. **High Court Websites** (Free)
Each High Court provides judgment downloads:
- Delhi HC: https://delhihighcourt.nic.in/
- Bombay HC: https://bombayhighcourt.nic.in/
- Calcutta HC: https://calcuttahighcourt.nic.in/
- Madras HC: https://hcmadras.tn.gov.in/
- Karnataka HC: https://karnatakajudiciary.kar.nic.in/
- And 20+ more...

---

## 📊 Building Your Local Database

### Architecture

```
┌─────────────────────────────────────────────────┐
│          User searches for "Section 420"         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│        Your Backend API (Node.js/Express)        │
│  • Check local database first                    │
│  • Fall back to external APIs if needed          │
└────────────────┬────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
┌─────────────────┐  ┌─────────────────────┐
│ PostgreSQL/      │  │ Pinecone Vector DB  │
│ SQLite Database  │  │ (Semantic Search)   │
│                  │  │                     │
│ • Case metadata  │  │ • Text embeddings   │
│ • Full text      │  │ • Similarity search │
│ • Indexes        │  │ • Related cases     │
└─────────────────┘  └─────────────────────┘
```

### Database Schema

```sql
CREATE TABLE judgments (
    id VARCHAR(255) PRIMARY KEY,
    case_number VARCHAR(255) NOT NULL,
    case_title TEXT NOT NULL,
    court VARCHAR(255) NOT NULL,
    judges TEXT[], -- Array of judge names
    judgment_date DATE NOT NULL,
    petitioner TEXT NOT NULL,
    respondent TEXT NOT NULL,
    citations TEXT[], -- e.g., ["2023 AIR 123", "2023 SCC 456"]
    acts TEXT[], -- e.g., ["IPC", "CrPC"]
    sections TEXT[], -- e.g., ["Section 420", "Section 34"]
    judgment_text TEXT, -- Full judgment
    headnotes TEXT, -- Summary
    keywords TEXT[],
    pdf_url VARCHAR(500),
    source VARCHAR(50), -- 'supreme-court', 'high-court', etc.
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_court ON judgments(court);
CREATE INDEX idx_date ON judgments(judgment_date);
CREATE INDEX idx_citations ON judgments USING GIN (citations);
CREATE INDEX idx_sections ON judgments USING GIN (sections);
CREATE FULLTEXT INDEX idx_text ON judgments(judgment_text);
```

---

## 🚀 Implementation Steps

### Step 1: Register for eCourts API (5 minutes)
1. Visit https://services.ecourts.gov.in/
2. Fill registration form
3. Get API credentials
4. Add to your `.env` file

### Step 2: Download Supreme Court Bulk Data (1 hour)
```bash
# Download SC judgment archive
curl -O https://main.sci.gov.in/judgments/archive.zip

# Extract PDFs
unzip archive.zip -d ./judgments/

# Process PDFs with pdf-parse
npm install pdf-parse
node scripts/import-sc-judgments.js
```

### Step 3: Set Up Database (30 minutes)
```bash
# Install PostgreSQL
# Create database
createdb legal_judgments

# Run migrations
npm run db:migrate
```

### Step 4: Generate Embeddings (2 hours for 10,000 docs)
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// For each judgment:
for (const judgment of judgments) {
  const embedding = await generateEmbedding(
    `${judgment.case_title} ${judgment.headnotes} ${judgment.judgment_text.substring(0, 5000)}`
  );
  
  await pinecone.upsert({
    id: judgment.id,
    values: embedding,
    metadata: {
      case_number: judgment.case_number,
      court: judgment.court,
      date: judgment.judgment_date
    }
  });
}
```

### Step 5: Implement Search (1 hour)
```typescript
// Hybrid search: Full-text + Vector similarity
export async function searchJudgments(query: string) {
  // 1. Full-text search in PostgreSQL
  const textResults = await db.query(
    `SELECT * FROM judgments 
     WHERE to_tsvector('english', judgment_text) @@ plainto_tsquery('english', $1)
     ORDER BY ts_rank(to_tsvector('english', judgment_text), plainto_tsquery('english', $1)) DESC
     LIMIT 50`,
    [query]
  );
  
  // 2. Vector similarity search in Pinecone
  const queryEmbedding = await generateEmbedding(query);
  const vectorResults = await pinecone.query({
    vector: queryEmbedding,
    topK: 50,
    includeMetadata: true
  });
  
  // 3. Merge and rank results
  return mergeResults(textResults, vectorResults);
}
```

---

## 💰 Cost Analysis

### Option A: India Kanoon API
| Usage | Cost |
|-------|------|
| 1,000 searches | Rs. 200 |
| 10,000 searches | Rs. 2,000 |
| 100,000 searches | Rs. 20,000 |

### Option B: Local Database (Legal Sources)
| Component | One-time | Monthly |
|-----------|----------|---------|
| Development | 40 hours | - |
| Server (AWS) | - | Rs. 500 |
| Database (PostgreSQL) | - | Rs. 300 |
| Pinecone (Vector DB) | - | Rs. 0 (Free tier: 1M vectors) |
| **Total** | **40 hours** | **Rs. 800** |

**Break-even point**: ~4,000 searches

### Recommended: Hybrid Approach
1. Use India Kanoon API for rare/specific searches
2. Cache results in local database
3. Build local database incrementally
4. After 6 months, mostly local (95% cache hit rate)

---

## 📈 Storage Estimates

### Supreme Court Only
- **Total cases**: ~350,000 (since 1950)
- **New cases/year**: ~35,000
- **Average text**: 10-50 KB per judgment
- **Total storage**: ~3.5 GB - 17.5 GB
- **Database + Vectors**: ~20 GB total
- **Cost**: Rs. 200-500/month on AWS/Azure

### All Courts (Ambitious)
- **Supreme Court**: 350,000 cases
- **High Courts**: ~8 million cases
- **District Courts**: ~30 million pending cases
- **Total**: ~40 million cases
- **Storage**: ~400 GB - 2 TB
- **Cost**: Rs. 2,000-5,000/month

**Recommendation**: Start with Supreme Court only, expand based on usage.

---

## ⚡ Quick Start (Copy-Paste Ready)

### 1. Add to package.json
```json
{
  "dependencies": {
    "pdf-parse": "^1.1.1",
    "pg": "^8.11.3",
    "@pinecone-database/pinecone": "^2.0.0"
  }
}
```

### 2. Environment Variables
```bash
# eCourts API
ECOURTS_API_KEY=your_ecourts_api_key
ECOURTS_API_SECRET=your_ecourts_secret

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/legal_judgments

# Already have these:
VITE_GOOGLE_AI_API_KEY=your_google_ai_key
VITE_PINECONE_API_KEY=your_pinecone_key
```

### 3. Run Initial Import
```bash
# Import Supreme Court judgments
npm run import:supreme-court

# Sync with eCourts
npm run sync:ecourts

# Generate embeddings
npm run generate:embeddings
```

---

## ✅ Legal Compliance Checklist

- [ ] Using only government/official sources
- [ ] Not scraping India Kanoon
- [ ] Respecting robots.txt on official sites
- [ ] Proper attribution to data sources
- [ ] Terms of Service compliance
- [ ] Data retention policies
- [ ] User privacy protection
- [ ] Regular updates from official sources

---

## 🎯 Recommendation

**For Your Project (BetterCallAI):**

1. **Phase 1 (Now)**: Use India Kanoon API with mock fallback ✅ (Done)
2. **Phase 2 (Next 2 weeks)**: Register for eCourts API, add as data source
3. **Phase 3 (Next month)**: Download SC bulk data, build local database
4. **Phase 4 (Next 3 months)**: Add High Courts incrementally
5. **Phase 5 (Next 6 months)**: Implement hybrid search (local + API)

**This approach is:**
- ✅ 100% Legal
- ✅ Cost-effective long-term
- ✅ Scalable
- ✅ Better user experience (faster, offline-capable)
- ✅ Adds unique value (semantic search, related cases)

---

## 📚 Resources

- eCourts Documentation: https://services.ecourts.gov.in/ecourtindia_v6/
- Supreme Court: https://main.sci.gov.in/
- NJDG: https://njdg.ecourts.gov.in/
- Indian Kanoon (for reference): https://indiankanoon.org/
- Legal Database Best Practices: https://www.legalserviceindia.com/

---

**Questions? Need help implementing? Let me know!** 🚀
