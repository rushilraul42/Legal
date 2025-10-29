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

      const prompt = `You are a senior legal counsel specializing in Indian jurisprudence with expertise in constitutional law, civil and criminal procedure, and statutory interpretation. Analyze this legal document with the rigor and precision expected in High Court and Supreme Court proceedings.

CRITICAL INSTRUCTIONS:
- Use proper legal terminology and Latin maxims where appropriate
- Cite specific statutory provisions with section numbers
- Reference constitutional articles and fundamental rights
- Identify ratio decidendi and obiter dicta if this is a judgment
- Apply principles of statutory interpretation (literal, golden, mischief rules)
- Consider doctrine of precedent and stare decisis
- Analyze procedural compliance with CPC/CrPC requirements

${context ? `ADDITIONAL CONTEXT: ${context}` : ''}

DOCUMENT FOR ANALYSIS:
${documentText.substring(0, 5000)}${documentText.length > 5000 ? '\n[Document truncated for analysis - first 5000 characters]' : ''}

Provide comprehensive legal analysis in JSON format:
{
  "summary": "Detailed case synopsis including: (1) Nature of proceedings (original/appellate/revisional), (2) Principal legal questions raised, (3) Statutory framework invoked, (4) Court's findings and reasoning, (5) Final disposition with specific relief granted/denied. Use precise legal terminology.",
  "keyPoints": [
    "Point 1 with specific statutory reference (e.g., 'Section 141 of Negotiable Instruments Act, 1881 - vicarious liability of directors')",
    "Point 2 citing constitutional provision (e.g., 'Article 14 violation - arbitrary state action without reasonable classification')",
    "Include at least 6-8 detailed points with legal citations"
  ],
  "legalIssues": [
    "Frame issues as courts would - use 'Whether...' format",
    "Issue 1: Whether the impugned order suffers from violation of principles of natural justice...",
    "Issue 2: Whether the statutory provision is ultra vires Article 19(1)(g)...",
    "Issue 3: Whether there exists a cause of action maintainable in law...",
    "Include 4-6 precisely framed legal issues"
  ],
  "recommendations": [
    "CRITICAL: NO generic recommendations allowed. Each MUST cite specific sections, acts, and timelines.",
    "Example GOOD: 'File review petition under Article 137 of Constitution read with Order 47 Rule 1 CPC before the Supreme Court within 30 days from the date of judgment. Ensure application demonstrates error apparent on face of record per Lily Thomas v. Union of India (2000) 6 SCC 224.'",
    "Example BAD: 'Consider filing an appeal' or 'Review procedural compliance' - TOO GENERIC",
    "Recommendation 1: File [specific application] under Section X of [Act name] within [exact days] per Article Y of Limitation Act, 1963",
    "Recommendation 2: Invoke writ jurisdiction under Article 226/32 specifying which fundamental right and which constitutional article violated",
    "Recommendation 3: Cite binding precedent [Case Name v. Case Name, Citation] with specific legal principle applied",
    "Include 5-7 detailed recommendations, each 2-3 sentences with full statutory backing"
  ],
  "precedentSuggestions": [
    "Relevant Supreme Court/High Court judgments with proper citations",
    "Format: Case Name vs. Case Name, [Year] Citation (Court) - Brief holding",
    "Example: Kesavananda Bharati vs. State of Kerala, AIR 1973 SC 1461 - Basic Structure Doctrine",
    "Include 4-6 key precedents that are directly applicable"
  ]
}`;

      const model = this.gemini.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
          maxOutputTokens: 8192,
        }
      });

      console.log("🔍 Starting Gemini analysis with enhanced prompt...");
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      console.log("✅ Gemini response received, length:", responseText.length);
      
      const analysis = JSON.parse(responseText || "{}");
      console.log("📊 Analysis parsed - keyPoints:", analysis.keyPoints?.length, "recommendations:", analysis.recommendations?.length);
      
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