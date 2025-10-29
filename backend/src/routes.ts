import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import pdfParse from "pdf-parse";
import { storage } from "./storage";
import { ragService } from "./services/ragService";
import { indiaKanoonService } from "./services/indiaKanoonService"; 
import { aiService } from "./services/aiService";
import { searchQuerySchema } from "@shared/schema";

// Extend Request interface for file uploads
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype.includes('document') ||
        file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      service: "BetterCallAI Backend" 
    });
  });

  // Search cases endpoint
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const filters = {
        court: req.query.court as string,
        jurisdiction: req.query.jurisdiction as string,
        documentType: req.query.documentType as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const results = await storage.searchCases(query, filters);
      res.json(results);
    } catch (error: any) {
      console.error("Search error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get case by ID
  app.get("/api/case/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const caseData = await storage.getCaseById(id);
      
      if (!caseData) {
        return res.status(404).json({ error: "Case not found" });
      }

      res.json(caseData);
    } catch (error: any) {
      console.error("Get case error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Analyze judgment endpoint with RAG integration
  app.post("/api/analyze-judgment", upload.single('document'), async (req: MulterRequest, res) => {
    try {
      let documentText = "";
      let documentName = "uploaded-document.pdf";

      // Handle file upload
      if (req.file) {
        documentName = req.file.originalname;
        
        if (req.file.mimetype === 'application/pdf') {
          // Parse PDF content
          try {
            const pdfData = await pdfParse(req.file.buffer);
            documentText = pdfData.text;
          } catch (pdfError) {
            console.error("PDF parsing error:", pdfError);
            return res.status(400).json({ error: "Failed to parse PDF file" });
          }
        } else {
          documentText = req.file.buffer.toString('utf-8');
        }
      } else if (req.body.content) {
        // Handle text content directly
        documentText = req.body.content;
        documentName = req.body.documentName || "text-input.txt";
      } else {
        return res.status(400).json({ error: "No document or content provided" });
      }

      if (!documentText.trim()) {
        return res.status(400).json({ error: "Document appears to be empty or unreadable" });
      }

      // Use RAG for comprehensive analysis
      const ragAnalysis = await ragService.analyzeJudgmentWithRAG(documentText);
      
      // Get additional AI insights
      const aiAnalysis = await aiService.analyzeLegalDocument(documentText);
      
      // Search for relevant precedents using India Kanoon
      const precedents = await indiaKanoonService.findRelevantPrecedents(documentText);

      // Combine results into comprehensive analysis
      const analysis = {
        id: `analysis-${Date.now()}`,
        documentName,
        uploadDate: new Date().toISOString(),
        analysis: {
          summary: ragAnalysis.summary,
          keyPoints: ragAnalysis.keyPoints,
          precedentsFound: ragAnalysis.relevantLaws.slice(0, 5).map(law => ({
            caseId: law.id,
            caseTitle: law.lawName,
            relevance: `Relevant for ${law.metadata.category.toLowerCase()} - ${law.section}`,
            citation: law.metadata.citation || law.section
          })),
          legalIssues: aiAnalysis.legalIssues,
          recommendations: ragAnalysis.recommendations,
          sentiment: `Analysis confidence: ${Math.round(ragAnalysis.confidence * 100)}%`,
          externalPrecedents: precedents.slice(0, 3).map(p => ({
            title: p.title,
            court: p.court,
            date: p.docdisplaydate,
            url: p.url
          }))
        },
        confidence: ragAnalysis.confidence,
        processingTime: "2-3 seconds"
      };
      
      res.json(analysis);
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ 
        error: error.message,
        fallback: await storage.analyzeJudgment("fallback-document", "")
      });
    }
  });

  // Enhanced vector search endpoint with RAG
  app.get("/api/vector-search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Use RAG service for semantic search
      const ragResults = await ragService.searchRelevantLaws(query, limit);
      
      // Also get traditional storage results for fallback
      const storageResults = await storage.vectorSearch(query);
      
      // Combine and rank results
      const combinedResults = {
        query,
        semanticResults: ragResults,
        fallbackResults: storageResults,
        totalFound: ragResults.length,
        confidence: ragResults.length > 0 ? 
          ragResults.reduce((sum, r) => sum + r.relevanceScore, 0) / ragResults.length : 0
      };
      
      res.json(combinedResults);
    } catch (error: any) {
      console.error("Vector search error:", error);
      const fallbackResults = await storage.vectorSearch(req.query.q as string || "");
      res.status(500).json({ 
        error: error.message,
        fallback: fallbackResults
      });
    }
  });

  // RAG-specific endpoints
  app.post("/api/rag/upload-document", async (req, res) => {
    try {
      const { document } = req.body;
      
      if (!document || !document.id || !document.content) {
        return res.status(400).json({ error: "Invalid document format" });
      }
      
      await ragService.uploadLegalDocument(document);
      res.json({ success: true, message: "Document uploaded to vector database" });
    } catch (error: any) {
      console.error("Document upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/rag/batch-upload", async (req, res) => {
    try {
      const { documents, batchSize = 100 } = req.body;
      
      if (!documents || !Array.isArray(documents)) {
        return res.status(400).json({ error: "Documents array is required" });
      }
      
      await ragService.batchUploadDocuments(documents, batchSize);
      res.json({ 
        success: true, 
        message: `Successfully uploaded ${documents.length} documents`,
        processed: documents.length
      });
    } catch (error: any) {
      console.error("Batch upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI-powered legal chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }
      
      const response = await aiService.chatWithLegalAI(messages);
      
      res.json({
        response,
        timestamp: new Date().toISOString(),
        context: context || null
      });
    } catch (error: any) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Legal entity extraction endpoint
  app.post("/api/ai/extract-entities", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      
      const entities = await aiService.extractLegalEntities(text);
      res.json(entities);
    } catch (error: any) {
      console.error("Entity extraction error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // India Kanoon integration endpoints
  app.get("/api/india-kanoon/search", async (req, res) => {
    try {
      const searchParams = {
        query: req.query.q as string || "",
        maxResults: parseInt(req.query.maxResults as string) || 50, // Reduced from 1000 to save API costs
        pagenum: parseInt(req.query.pagenum as string) || 0,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        court: req.query.court as string,
        doctype: req.query.doctype as string,
        title: req.query.title as string,
        cite: req.query.cite as string,
        author: req.query.author as string,
        bench: req.query.bench as string,
      };
      
      const results = await indiaKanoonService.searchCases(searchParams);
      res.json(results);
    } catch (error: any) {
      console.error("India Kanoon search error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/india-kanoon/case/:caseId", async (req, res) => {
    try {
      const { caseId } = req.params;
      const caseDetails = await indiaKanoonService.getCaseDetails(caseId);
      
      if (!caseDetails) {
        return res.status(404).json({ error: "Case not found" });
      }
      
      res.json(caseDetails);
    } catch (error: any) {
      console.error("India Kanoon case details error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/india-kanoon/advanced-search", async (req, res) => {
    try {
      const searchParams = req.body;
      const results = await indiaKanoonService.advancedSearch(searchParams);
      res.json(results);
    } catch (error: any) {
      console.error("Advanced search error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // User authentication endpoints (for Firebase integration)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, displayName, photoURL, firebaseUid } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByFirebaseUid(firebaseUid);
      if (existingUser) {
        return res.json(existingUser);
      }

      // Create new user
      const user = await storage.createUser({
        email,
        displayName,
        photoURL,
        firebaseUid,
      });

      res.json(user);
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/user/:firebaseUid", async (req, res) => {
    try {
      const { firebaseUid } = req.params;
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
