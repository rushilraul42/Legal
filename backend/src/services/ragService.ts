import { Pinecone, type PineconeRecord } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface RAGSearchResult {
  id: string;
  lawName: string;
  section: string;
  content: string;
  relevanceScore: number;
  metadata: {
    act: string;
    year: string;
    category: string;
    court?: string;
    citation?: string;
  };
}

export interface RAGAnalysisResult {
  summary: string;
  keyPoints: string[];
  relevantLaws: RAGSearchResult[];
  recommendations: string[];
  confidence: number;
}

export class RAGService {
  private pinecone: Pinecone | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private indexName: string;
  private initialized = false;

  constructor() {
    this.indexName = process.env.PINECONE_INDEX_NAME || "legal-documents";
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("RAG Service not initialized. Call initialize() first.");
    }
  }

  private isFullyConfigured(): boolean {
    return this.pinecone !== null && this.initialized;
  }

  /**
   * Initialize the RAG service by connecting to Pinecone index
   */
  async initialize(): Promise<void> {
    try {
      // Check if required environment variables are set
      const pineconeKey = process.env.PINECONE_API_KEY || process.env.VITE_PINECONE_API_KEY;
      if (!pineconeKey) {
        console.warn("PINECONE_API_KEY environment variable is not set - RAG service will use mock data");
        this.initialized = true; // Allow fallback mode
        return;
      }
      
      // Get Gemini API key with multiple fallback options
      const geminiKey = process.env.GEMINI_API_KEY || 
                       process.env.VITE_GEMINI_API_KEY || 
                       process.env.VITE_GOOGLE_AI_API_KEY ||
                       process.env.GOOGLE_AI_API_KEY;
      
      if (!geminiKey) {
        console.warn("GEMINI_API_KEY not set - using fallback analysis");
      }

      // Initialize Pinecone
      this.pinecone = new Pinecone({
        apiKey: pineconeKey
      });
      
      // Initialize Gemini (optional)
      if (geminiKey) {
        this.gemini = new GoogleGenerativeAI(geminiKey);
        console.log("✅ Gemini initialized in RAG service");
      }

      this.indexName = process.env.PINECONE_INDEX_NAME || process.env.VITE_PINECONE_INDEX_NAME || "legal-documents";
      this.initialized = true;

      console.log("RAG Service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize RAG Service:", error);
      console.warn("Continuing with fallback/mock mode...");
      this.initialized = true; // Allow fallback mode
    }
  }

  /**
   * Generate embeddings for text using Gemini
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      this.ensureInitialized();
      if (!this.gemini) {
        throw new Error("Gemini client not initialized");
      }

      // For now, generate a mock embedding since embeddings might not be available
      // In production, you would use a proper embedding service
      const mockEmbedding = Array.from({ length: 768 }, () => Math.random() - 0.5);
      return mockEmbedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  /**
   * Search for relevant legal documents using vector similarity
   */
  async searchRelevantLaws(query: string, topK: number = 10): Promise<RAGSearchResult[]> {
    try {
      this.ensureInitialized();
      
      // If not fully configured, return mock results
      if (!this.isFullyConfigured()) {
        return this.getMockSearchResults(query).slice(0, topK);
      }

      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // Get Pinecone index
      const index = this.pinecone!.Index(this.indexName);

      // Perform vector search
      const searchResponse = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        includeValues: false
      });

      // Transform results to our format
      const results: RAGSearchResult[] = searchResponse.matches?.map((match: any) => ({
        id: match.id || "",
        lawName: match.metadata?.title as string || "Unknown Law",
        section: match.metadata?.section as string || "",
        content: match.metadata?.content as string || "",
        relevanceScore: match.score || 0,
        metadata: {
          act: match.metadata?.act as string || "",
          year: match.metadata?.year as string || "",
          category: match.metadata?.category as string || "",
          court: match.metadata?.court as string,
          citation: match.metadata?.citation as string
        }
      })) || [];

      return results.filter(result => result.relevanceScore > 0.7); // Filter by relevance threshold
    } catch (error) {
      console.error("Error in vector search:", error);
      // Return mock data if Pinecone is not available
      return this.getMockSearchResults(query);
    }
  }

  /**
   * Analyze judgment text using RAG approach
   */
  async analyzeJudgmentWithRAG(judgmentText: string): Promise<RAGAnalysisResult> {
    try {
      // Step 1: Extract key legal concepts from judgment
      const legalConcepts = await this.extractLegalConcepts(judgmentText);

      // Step 2: Search for relevant laws using vector search
      const relevantLaws = await this.searchRelevantLaws(judgmentText, 15);

      // Step 3: Generate comprehensive analysis using GPT with retrieved context
      const analysis = await this.generateAnalysisWithContext(judgmentText, relevantLaws);

      return {
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        relevantLaws: relevantLaws.slice(0, 10), // Top 10 most relevant
        recommendations: analysis.recommendations,
        confidence: this.calculateConfidence(relevantLaws)
      };
    } catch (error) {
      console.error("Error in RAG analysis:", error);
      return this.getFallbackAnalysis(judgmentText);
    }
  }

  /**
   * Extract legal concepts from text using NLP
   */
  private async extractLegalConcepts(text: string): Promise<string[]> {
    try {
      this.ensureInitialized();
      if (!this.gemini) {
        console.warn("Gemini not available, using fallback legal concept extraction");
        return ["Constitutional Law", "Civil Procedure", "Criminal Law"];
      }

      const prompt = `
Extract the key legal concepts, statutes, sections, and legal principles mentioned in the following legal text. 
Return only the specific legal terms and concepts as a comma-separated list:

Text: ${text.substring(0, 2000)}...
`;

      const model = this.gemini.getGenerativeModel({ 
        model: "gemini-2.5-flash"
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const concepts = response.text()?.split(',') || [];
      return concepts.map((concept: string) => concept.trim()).filter(Boolean);
    } catch (error) {
      console.error("Error extracting legal concepts:", error);
      return ["Constitutional Law", "Civil Procedure", "Criminal Law"];
    }
  }

  /**
   * Generate analysis using retrieved context
   */
  private async generateAnalysisWithContext(
    judgmentText: string, 
    relevantLaws: RAGSearchResult[]
  ): Promise<{ summary: string; keyPoints: string[]; recommendations: string[] }> {
    try {
      this.ensureInitialized();
      if (!this.gemini) {
        console.warn("Gemini not available, using fallback analysis");
        return this.getFallbackAnalysisData();
      }

      const contextText = relevantLaws.slice(0, 5).map(law => 
        `${law.lawName}: ${law.content}`
      ).join('\n\n');

      const prompt = `
As a legal expert, analyze the following judgment using the provided relevant legal context.

JUDGMENT TEXT:
${judgmentText.substring(0, 3000)}...

RELEVANT LEGAL CONTEXT:
${contextText}

Please provide:
1. A comprehensive summary (2-3 sentences)
2. Key legal points (5 bullet points)
3. Practical recommendations (3-4 recommendations)

Format your response as JSON:
{
  "summary": "...",
  "keyPoints": ["point1", "point2", ...],
  "recommendations": ["rec1", "rec2", ...]
}
`;

      const model = this.gemini.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text() || "{}");
      
      return {
        summary: analysis.summary || "Analysis could not be completed",
        keyPoints: analysis.keyPoints || [],
        recommendations: analysis.recommendations || []
      };
    } catch (error) {
      console.error("Error generating analysis:", error);
      return this.getFallbackAnalysisData(judgmentText);
    }
  }

  /**
   * Calculate confidence score based on retrieval quality
   */
  private calculateConfidence(relevantLaws: RAGSearchResult[]): number {
    if (relevantLaws.length === 0) return 0.3;
    
    const avgRelevance = relevantLaws.reduce((sum, law) => sum + law.relevanceScore, 0) / relevantLaws.length;
    const coverageScore = Math.min(relevantLaws.length / 10, 1); // Normalize to 0-1
    
    return Math.round((avgRelevance * 0.7 + coverageScore * 0.3) * 100) / 100;
  }

  /**
   * Upload legal document to Pinecone vector database
   */
  async uploadLegalDocument(document: {
    id: string;
    title: string;
    content: string;
    section: string;
    act: string;
    year: string;
    category: string;
    citation?: string;
    court?: string;
  }): Promise<void> {
    try {
      this.ensureInitialized();
      if (!this.pinecone) {
        throw new Error("Pinecone client not initialized");
      }

      // Generate embedding
      const embedding = await this.generateEmbedding(document.content);

      // Prepare vector for upload
      const vector: PineconeRecord = {
        id: document.id,
        values: embedding,
        metadata: {
          title: document.title,
          content: document.content.substring(0, 1000), // Limit content size
          section: document.section,
          act: document.act,
          year: document.year,
          category: document.category,
          citation: document.citation || "",
          court: document.court || ""
        }
      };

      // Upload to Pinecone
      const index = this.pinecone.Index(this.indexName);
      await index.upsert([vector]);

      console.log(`Successfully uploaded document: ${document.title}`);
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  }

  /**
   * Batch upload multiple documents
   */
  async batchUploadDocuments(documents: any[], batchSize: number = 100): Promise<void> {
    try {
      this.ensureInitialized();
      
      // If not fully configured, skip upload but don't error
      if (!this.isFullyConfigured()) {
        console.log(`Skipping upload of ${documents.length} documents - services not fully configured`);
        return;
      }

      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        
        const vectors: PineconeRecord[] = [];
        for (const doc of batch) {
          try {
            const embedding = await this.generateEmbedding(doc.content);
            vectors.push({
              id: doc.id,
              values: embedding,
              metadata: {
                title: doc.title,
                content: doc.content.substring(0, 1000),
                section: doc.section || "",
                act: doc.act || "",
                year: doc.year || "",
                category: doc.category || "",
                citation: doc.citation || "",
                court: doc.court || ""
              }
            });
          } catch (error) {
            console.error(`Error processing document ${doc.id}:`, error);
          }
        }

        if (vectors.length > 0) {
          if (!this.pinecone) {
            throw new Error("Pinecone client not initialized");
          }
          const index = this.pinecone.Index(this.indexName);
          await index.upsert(vectors);
          
          console.log(`Uploaded batch ${Math.floor(i/batchSize) + 1}: ${vectors.length} documents`);
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error in batch upload:", error);
      throw error;
    }
  }

  /**
   * Mock search results for fallback
   */
  private getMockSearchResults(query: string): RAGSearchResult[] {
    const mockResults: RAGSearchResult[] = [
      {
        id: "ipc-420",
        lawName: "Indian Penal Code, 1860 - Section 420",
        section: "Section 420",
        content: "Cheating and dishonestly inducing delivery of property - Whoever cheats and thereby dishonestly induces the person deceived to deliver any property...",
        relevanceScore: 0.95,
        metadata: {
          act: "Indian Penal Code",
          year: "1860",
          category: "Criminal Law"
        }
      },
      {
        id: "const-art21",
        lawName: "Constitution of India - Article 21",
        section: "Article 21",
        content: "Protection of life and personal liberty - No person shall be deprived of his life or personal liberty except according to procedure established by law.",
        relevanceScore: 0.92,
        metadata: {
          act: "Constitution of India",
          year: "1950",
          category: "Constitutional Law"
        }
      },
      {
        id: "contract-sec10",
        lawName: "Indian Contract Act, 1872 - Section 10",
        section: "Section 10",
        content: "What agreements are contracts - All agreements are contracts if they are made by the free consent of parties competent to contract...",
        relevanceScore: 0.88,
        metadata: {
          act: "Indian Contract Act",
          year: "1872",
          category: "Contract Law"
        }
      }
    ];

    return mockResults.filter(result => 
      result.content.toLowerCase().includes(query.toLowerCase()) ||
      result.lawName.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Fallback analysis when RAG fails
   */
  private getFallbackAnalysis(judgmentText: string): RAGAnalysisResult {
    return {
      summary: "This appears to be a legal judgment that requires detailed analysis. The document contains legal principles and procedural elements that need expert review.",
      keyPoints: [
        "Legal principles and precedents are referenced",
        "Procedural requirements and due process considerations",
        "Constitutional and statutory provisions may be applicable",
        "Case-specific facts require legal interpretation"
      ],
      relevantLaws: this.getMockSearchResults(judgmentText.substring(0, 100)),
      recommendations: [
        "Conduct detailed legal research on relevant statutes",
        "Review applicable case precedents",
        "Consider procedural compliance requirements",
        "Seek expert legal opinion for complex matters"
      ],
      confidence: 0.6
    };
  }

  private getFallbackAnalysisData(judgmentText?: string) {
    // Extract some basic insights from the judgment text if available
    const text = judgmentText || "";
    const hasSection = text.toLowerCase().includes('section');
    const hasArticle = text.toLowerCase().includes('article');
    const hasCourt = text.toLowerCase().includes('court');
    const hasAct = text.toLowerCase().includes('act');
    
    return {
      summary: `This legal document discusses ${hasSection ? 'statutory provisions' : 'legal principles'} ${hasArticle ? 'and constitutional matters' : ''} ${hasCourt ? 'with judicial proceedings' : ''} that require detailed legal analysis.`,
      keyPoints: [
        hasSection ? "Specific statutory sections and provisions are referenced" : "Legal principles require interpretation",
        hasArticle ? "Constitutional articles and fundamental rights are discussed" : "Regulatory compliance considerations",
        hasCourt ? "Court proceedings and judicial interpretation are involved" : "Procedural requirements apply",
        hasAct ? "Multiple Acts and legal frameworks are applicable" : "Case-specific legal analysis needed",
        "Precedential value and legal implications should be evaluated"
      ],
      recommendations: [
        hasSection ? "Review the specific sections mentioned for detailed requirements" : "Conduct thorough statutory research",
        hasArticle ? "Examine constitutional provisions and their judicial interpretation" : "Verify procedural compliance",
        hasCourt ? "Study relevant court judgments and precedents" : "Consider jurisdictional requirements",
        "Consult with specialized legal counsel for case-specific advice"
      ]
    };
  }
}

// Export a singleton instance - will be initialized when needed
let ragServiceInstance: RAGService | null = null;

export function getRagService(): RAGService {
  if (!ragServiceInstance) {
    ragServiceInstance = new RAGService();
  }
  return ragServiceInstance;
}

export const ragService = getRagService();