import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for Firebase authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  firebaseUid: text("firebase_uid").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  displayName: true,
  photoURL: true,
  firebaseUid: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Legal Case schema
export const legalCase = z.object({
  id: z.string(),
  caseNumber: z.string(),
  title: z.string(),
  court: z.string(),
  date: z.string(),
  judges: z.array(z.string()),
  excerpt: z.string(),
  fullText: z.string().optional(),
  citations: z.array(z.string()).optional(),
  jurisdiction: z.string(),
  documentType: z.string(),
  petitioner: z.string().optional(),
  respondent: z.string().optional(),
  verdict: z.string().optional(),
  headnotes: z.array(z.string()).optional(),
  relatedCases: z.array(z.string()).optional(),
});

export type LegalCase = z.infer<typeof legalCase>;

// Search Query schema
export const searchQuerySchema = z.object({
  query: z.string().min(1),
  filters: z.object({
    court: z.string().optional(),
    jurisdiction: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    documentType: z.string().optional(),
  }).optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// Search Result schema
export const searchResultSchema = z.object({
  cases: z.array(legalCase),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

// Judgment Analysis schema
export const judgmentAnalysisSchema = z.object({
  id: z.string(),
  documentName: z.string(),
  uploadDate: z.string(),
  analysis: z.object({
    summary: z.string(),
    keyPoints: z.array(z.string()),
    precedentsFound: z.array(z.object({
      caseId: z.string(),
      caseTitle: z.string(),
      relevance: z.string(),
      citation: z.string(),
    })),
    lawsApplied: z.array(z.object({
      provision: z.string(),
      fullText: z.string(),
      act: z.string(),
      section: z.string(),
      relevance: z.string(),
    })).optional(),
    legalIssues: z.array(z.string()),
    recommendations: z.array(z.string()),
    sentiment: z.string().optional(),
  }),
});

export type JudgmentAnalysis = z.infer<typeof judgmentAnalysisSchema>;

// Vector Search Result schema
export const vectorSearchResultSchema = z.object({
  id: z.string(),
  lawName: z.string(),
  section: z.string(),
  content: z.string(),
  relevanceScore: z.number(),
  metadata: z.object({
    act: z.string(),
    year: z.string().optional(),
    category: z.string().optional(),
  }),
});

export type VectorSearchResult = z.infer<typeof vectorSearchResultSchema>;

// Saved Search schema
export const savedSearchSchema = z.object({
  id: z.string(),
  userId: z.string(),
  query: z.string(),
  filters: z.record(z.any()).optional(),
  savedAt: z.string(),
  name: z.string(),
});

export type SavedSearch = z.infer<typeof savedSearchSchema>;
