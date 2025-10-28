import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchQuerySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Analyze judgment endpoint
  app.post("/api/analyze-judgment", async (req, res) => {
    try {
      // In a real implementation, this would process the uploaded file
      // For now, we'll use mock data
      const documentName = "sample-judgment.pdf";
      const content = "Sample judgment content";
      
      const analysis = await storage.analyzeJudgment(documentName, content);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      res.json(analysis);
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vector search endpoint
  app.get("/api/vector-search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const results = await storage.vectorSearch(query);
      res.json(results);
    } catch (error: any) {
      console.error("Vector search error:", error);
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
