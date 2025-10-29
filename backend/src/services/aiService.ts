import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIAnalysisResult {
  summary: string;
  keyPoints: string[];
  legalIssues: string[];
  recommendations: string[];
  precedentSuggestions: string[];
  confidence: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIService {
  private gemini: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || 
                   process.env.VITE_GEMINI_API_KEY || 
                   process.env.VITE_GOOGLE_AI_API_KEY ||
                   process.env.GOOGLE_AI_API_KEY;
    
    if (apiKey) {
      this.gemini = new GoogleGenerativeAI(apiKey);
      console.log("✅ Gemini AI service initialized successfully");
    } else {
      console.warn("⚠️  Gemini API key not available - using fallback responses");
    }
  }

  /**
   * Analyze legal document using Gemini
   */
  async analyzeLegalDocument(documentText: string, context?: string): Promise<AIAnalysisResult> {
    try {
      if (!this.gemini) {
        console.warn("Gemini not available, using fallback analysis");
        return this.getFallbackAnalysis(documentText);
      }

      const prompt = `You are an expert legal AI assistant specializing in Indian law. 
Analyze legal documents with precision, citing relevant statutes, case law, and legal principles.
Focus on constitutional law, civil and criminal procedures, and statutory interpretation.

Please analyze the following legal document and provide:

1. A comprehensive summary (2-3 sentences)
2. Key legal points (5-6 bullet points)
3. Legal issues identified (3-5 issues)
4. Practical recommendations (4-5 recommendations)
5. Relevant precedent suggestions (3-4 cases or statutes to research)

${context ? `Additional Context: ${context}` : ''}

Document Text:
${documentText.substring(0, 4000)}${documentText.length > 4000 ? '...' : ''}

Provide your analysis in JSON format:
{
  "summary": "...",
  "keyPoints": ["point1", "point2", ...],
  "legalIssues": ["issue1", "issue2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "precedentSuggestions": ["precedent1", "precedent2", ...]
}`;

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
        legalIssues: analysis.legalIssues || [],
        recommendations: analysis.recommendations || [],
        precedentSuggestions: analysis.precedentSuggestions || [],
        confidence: this.calculateConfidence(documentText, analysis)
      };

    } catch (error) {
      console.error("AI Analysis error:", error);
      return this.getFallbackAnalysis(documentText);
    }
  }

  /**
   * Generate legal research questions based on case text
   */
  async generateResearchQuestions(caseText: string): Promise<string[]> {
    try {
      if (!this.gemini) {
        return [
          "What are the relevant statutory provisions applicable to this case?",
          "Are there any recent precedents that could influence the outcome?",
          "What procedural requirements must be satisfied?",
          "What are the potential defenses available?",
          "What remedies or relief can be sought?"
        ];
      }

      const prompt = `Based on this legal case text, generate 5 specific research questions that a lawyer should investigate:

${caseText.substring(0, 2000)}...

Return as a JSON array of strings:
["question1", "question2", "question3", "question4", "question5"]`;

      const model = this.gemini.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const data = JSON.parse(response.text() || '[]');
      return Array.isArray(data) ? data : data.questions || [];
    } catch (error) {
      console.error("Error generating research questions:", error);
      return [
        "What are the relevant statutory provisions applicable to this case?",
        "Are there any recent precedents that could influence the outcome?",
        "What procedural requirements must be satisfied?",
        "What are the potential defenses available?",
        "What remedies or relief can be sought?"
      ];
    }
  }

  /**
   * Summarize multiple case precedents
   */
  async summarizePrecedents(cases: Array<{ title: string; content: string }>): Promise<string> {
    try {
      if (!this.gemini) {
        return "Multiple precedents establish important legal principles that require detailed analysis.";
      }

      const casesText = cases.map(c => `${c.title}: ${c.content.substring(0, 500)}`).join('\n\n');
      
      const prompt = `Summarize these legal precedents and explain their collective significance:

${casesText}

Provide a coherent summary that explains:
1. Common legal principles
2. Evolution of jurisprudence
3. Practical implications for current practice`;

      const model = this.gemini.getGenerativeModel({ 
        model: "gemini-2.5-flash"
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || "Summary could not be generated";
    } catch (error) {
      console.error("Error summarizing precedents:", error);
      return "Multiple precedents establish important legal principles that require detailed analysis.";
    }
  }

  /**
   * Legal chatbot functionality
   */
  async chatWithLegalAI(messages: ChatMessage[]): Promise<string> {
    try {
      if (!this.gemini) {
        return "I'm currently unavailable. Please consult with a qualified legal professional for legal advice.";
      }

      const systemPrompt = `You are a knowledgeable legal AI assistant specializing in Indian law. 
Provide accurate, helpful legal information while reminding users that this is not legal advice 
and they should consult qualified lawyers for their specific situations. 
Focus on Indian constitutional law, civil and criminal procedure, and major statutes.`;

      // Combine system prompt with user messages
      const conversationHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
      const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationHistory}\n\nResponse:`;

      const model = this.gemini.getGenerativeModel({ 
        model: "gemini-2.5-flash"
      });

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text() || "I'm sorry, I couldn't process your request.";
    } catch (error) {
      console.error("Chat AI error:", error);
      return "I'm experiencing technical difficulties. Please try again later.";
    }
  }

  /**
   * Extract key legal entities from text
   */
  async extractLegalEntities(text: string): Promise<{
    statutes: string[];
    cases: string[];
    sections: string[];
    courts: string[];
    parties: string[];
  }> {
    try {
      if (!this.gemini) {
        return {
          statutes: [],
          cases: [],
          sections: [],
          courts: [],
          parties: []
        };
      }

      const prompt = `Extract legal entities from this text and categorize them:

${text.substring(0, 2000)}

Return as JSON:
{
  "statutes": ["act names"],
  "cases": ["case names"],
  "sections": ["section numbers with acts"],
  "courts": ["court names"],
  "parties": ["party names"]
}`;

      const model = this.gemini.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const entities = JSON.parse(response.text() || "{}");
      return {
        statutes: entities.statutes || [],
        cases: entities.cases || [],
        sections: entities.sections || [],
        courts: entities.courts || [],
        parties: entities.parties || []
      };
    } catch (error) {
      console.error("Error extracting entities:", error);
      return {
        statutes: [],
        cases: [],
        sections: [],
        courts: [],
        parties: []
      };
    }
  }

  /**
   * Generate legal brief outline
   */
  async generateBriefOutline(caseType: string, facts: string): Promise<string[]> {
    try {
      if (!this.gemini) {
        return [
          "I. Introduction and Statement of Facts",
          "II. Issues Presented", 
          "III. Legal Arguments",
          "IV. Relevant Case Law and Statutes",
          "V. Conclusion and Prayer for Relief"
        ];
      }

      const prompt = `Generate a legal brief outline for a ${caseType} case with these facts:

${facts}

Provide a structured outline as JSON array:
["I. Introduction and Statement of Facts", "II. Issues Presented", ...]`;

      const model = this.gemini.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const data = JSON.parse(response.text() || '[]');
      return Array.isArray(data) ? data : data.outline || [];
    } catch (error) {
      console.error("Error generating brief outline:", error);
      return [
        "I. Introduction and Statement of Facts",
        "II. Issues Presented", 
        "III. Legal Arguments",
        "IV. Relevant Case Law and Statutes",
        "V. Conclusion and Prayer for Relief"
      ];
    }
  }

  /**
   * Calculate confidence score for analysis
   */
  private calculateConfidence(documentText: string, analysis: any): number {
    let score = 0.5; // Base score
    
    // Text quality indicators
    if (documentText.length > 1000) score += 0.1;
    if (documentText.includes('section') || documentText.includes('article')) score += 0.1;
    
    // Analysis quality indicators  
    if (analysis.keyPoints?.length >= 3) score += 0.1;
    if (analysis.recommendations?.length >= 3) score += 0.1;
    if (analysis.legalIssues?.length >= 2) score += 0.1;
    if (analysis.precedentSuggestions?.length >= 2) score += 0.1;
    
    return Math.min(Math.round(score * 100) / 100, 0.95);
  }

  /**
   * Fallback analysis when AI fails
   */
  private getFallbackAnalysis(documentText: string): AIAnalysisResult {
    return {
      summary: "This legal document contains important legal principles and procedural elements that require detailed analysis by qualified legal professionals.",
      keyPoints: [
        "Document contains relevant legal provisions and case citations",
        "Procedural compliance and statutory requirements are mentioned", 
        "Constitutional and fundamental rights considerations may apply",
        "Evidence and burden of proof issues are relevant",
        "Jurisdictional and court procedure aspects are important"
      ],
      legalIssues: [
        "Statutory interpretation and application",
        "Constitutional validity and fundamental rights",
        "Procedural compliance and due process",
        "Evidence and burden of proof requirements"
      ],
      recommendations: [
        "Conduct thorough legal research on cited statutes and cases",
        "Verify procedural compliance with applicable court rules",
        "Review constitutional provisions and fundamental rights implications",
        "Consult with specialized legal counsel for case-specific advice",
        "Prepare comprehensive legal arguments with supporting precedents"
      ],
      precedentSuggestions: [
        "Research Supreme Court decisions on similar legal issues",
        "Review High Court judgments from relevant jurisdiction",
        "Examine statutory provisions and their judicial interpretation",
        "Study constitutional bench decisions on fundamental rights"
      ],
      confidence: 0.6
    };
  }
}

// Export singleton instance
export const aiService = new AIService();