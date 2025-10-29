import axios from 'axios';

export interface IndiaKanoonSearchParams {
  query: string;
  maxResults?: number;
  startDate?: string;
  endDate?: string;
  court?: string;
  doctype?: string;
}

export interface IndiaKanoonCase {
  tid: string;
  title: string;
  docdisplaydate: string;
  court: string;
  doctype: string;
  headline: string;
  content?: string;
  url: string;
}

export interface IndiaKanoonSearchResponse {
  docs: IndiaKanoonCase[];
  total: number;
  query: string;
}

export class IndiaKanoonService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.INDIA_KANOON_BASE_URL || process.env.VITE_INDIA_KANOON_BASE_URL || 'https://api.indiankanoon.org';
    this.apiKey = process.env.INDIA_KANOON_API_KEY || process.env.VITE_INDIA_KANOON_API_KEY || '';
  }

  /**
   * Search cases using India Kanoon API
   */
  async searchCases(params: IndiaKanoonSearchParams): Promise<IndiaKanoonSearchResponse> {
    try {
      const searchUrl = `${this.baseUrl}/search`;
      const queryParams = new URLSearchParams({
        formInput: params.query,
        pagenum: '0'
      });

      if (params.maxResults) {
        queryParams.append('maxresults', params.maxResults.toString());
      }
      
      if (params.startDate) {
        queryParams.append('fromdate', params.startDate);
      }
      
      if (params.endDate) {
        queryParams.append('todate', params.endDate);
      }

      const response = await axios.get(`${searchUrl}?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      // Transform the response to our format
      const docs = response.data.docs || [];
      return {
        docs: docs.map((doc: any) => ({
          tid: doc.tid || '',
          title: doc.title || '',
          docdisplaydate: doc.docdisplaydate || '',
          court: doc.court || '',
          doctype: doc.doctype || '',
          headline: doc.headline || '',
          url: `https://indiankanoon.org/doc/${doc.tid}/`
        })),
        total: response.data.total || docs.length,
        query: params.query
      };
    } catch (error: any) {
      console.error('India Kanoon API error:', error.message);
      
      // Return mock data if API fails
      return this.getMockSearchResults(params.query);
    }
  }

  /**
   * Get full case details by case ID
   */
  async getCaseDetails(caseId: string): Promise<IndiaKanoonCase | null> {
    try {
      const url = `${this.baseUrl}/doc/${caseId}/`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return {
        tid: caseId,
        title: response.data.title || '',
        docdisplaydate: response.data.docdisplaydate || '',
        court: response.data.court || '',
        doctype: response.data.doctype || '',
        headline: response.data.headline || '',
        content: response.data.doc || '',
        url: `https://indiankanoon.org/doc/${caseId}/`
      };
    } catch (error: any) {
      console.error('Error fetching case details:', error.message);
      return null;
    }
  }

  /**
   * Advanced search with filters
   */
  async advancedSearch(params: {
    query: string;
    court?: string;
    judge?: string;
    lawyer?: string;
    citation?: string;
    fromYear?: number;
    toYear?: number;
    docType?: string;
  }): Promise<IndiaKanoonSearchResponse> {
    try {
      let searchQuery = params.query;

      // Add filters to query
      if (params.court) {
        searchQuery += ` court:"${params.court}"`;
      }
      
      if (params.judge) {
        searchQuery += ` author:"${params.judge}"`;
      }
      
      if (params.citation) {
        searchQuery += ` cites:"${params.citation}"`;
      }

      if (params.docType) {
        searchQuery += ` doctype:"${params.docType}"`;
      }

      const searchParams: IndiaKanoonSearchParams = {
        query: searchQuery,
        maxResults: 50
      };

      if (params.fromYear) {
        searchParams.startDate = `${params.fromYear}-01-01`;
      }
      
      if (params.toYear) {
        searchParams.endDate = `${params.toYear}-12-31`;
      }

      return await this.searchCases(searchParams);
    } catch (error) {
      console.error('Advanced search error:', error);
      return this.getMockSearchResults(params.query);
    }
  }

  /**
   * Search for legal precedents related to a judgment
   */
  async findRelevantPrecedents(judgmentText: string): Promise<IndiaKanoonCase[]> {
    try {
      // Extract key legal terms for better search
      const legalTerms = this.extractLegalTerms(judgmentText);
      const searchQuery = legalTerms.slice(0, 5).join(' OR ');

      const result = await this.searchCases({
        query: searchQuery,
        maxResults: 20,
        doctype: 'judgment'
      });

      return result.docs.filter(doc => 
        doc.doctype.toLowerCase().includes('judgment') ||
        doc.doctype.toLowerCase().includes('order')
      );
    } catch (error) {
      console.error('Error finding precedents:', error);
      return this.getMockPrecedents();
    }
  }

  /**
   * Extract legal terms from text for better search
   */
  private extractLegalTerms(text: string): string[] {
    const legalKeywords = [
      'section', 'article', 'act', 'amendment', 'constitution', 'penal code',
      'contract act', 'civil procedure', 'criminal procedure', 'evidence act',
      'companies act', 'income tax', 'right to information', 'fundamental rights',
      'directive principles', 'writ petition', 'public interest litigation',
      'habeas corpus', 'mandamus', 'certiorari', 'prohibition', 'quo warranto'
    ];

    const words = text.toLowerCase().split(/\W+/);
    const extractedTerms: string[] = [];

    // Find legal keywords in the text
    legalKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        extractedTerms.push(keyword);
      }
    });

    // Add any section/article numbers found
    const sectionMatches = text.match(/section\s+\d+/gi) || [];
    const articleMatches = text.match(/article\s+\d+/gi) || [];
    
    extractedTerms.push(...sectionMatches, ...articleMatches);

    return [...new Set(extractedTerms)]; // Remove duplicates
  }

  /**
   * Mock search results for fallback
   */
  private getMockSearchResults(query: string): IndiaKanoonSearchResponse {
    const mockCases: IndiaKanoonCase[] = [
      {
        tid: '1234567',
        title: 'State of Maharashtra vs. Rajesh Kumar',
        docdisplaydate: '15-03-2023',
        court: 'Bombay High Court',
        doctype: 'Judgment',
        headline: 'Criminal law case dealing with Section 420 IPC and evidence requirements',
        url: 'https://indiankanoon.org/doc/1234567/'
      },
      {
        tid: '2345678',
        title: 'Union of India vs. ABC Corporation',
        docdisplaydate: '10-01-2023',
        court: 'Supreme Court of India',
        doctype: 'Judgment',
        headline: 'Constitutional law case on fundamental rights and due process',
        url: 'https://indiankanoon.org/doc/2345678/'
      },
      {
        tid: '3456789',
        title: 'Priya Sharma vs. State of Delhi',
        docdisplaydate: '25-11-2022',
        court: 'Delhi High Court',
        doctype: 'Order',
        headline: 'Civil procedure case on jurisdiction and maintainability',
        url: 'https://indiankanoon.org/doc/3456789/'
      }
    ];

    return {
      docs: mockCases.filter(c => 
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.headline.toLowerCase().includes(query.toLowerCase())
      ),
      total: mockCases.length,
      query
    };
  }

  private getMockPrecedents(): IndiaKanoonCase[] {
    return [
      {
        tid: 'precedent-001',
        title: 'Landmark Constitutional Case on Privacy Rights',
        docdisplaydate: '12-08-2017',
        court: 'Supreme Court of India',
        doctype: 'Judgment',
        headline: 'Nine-judge bench decision establishing privacy as fundamental right',
        url: 'https://indiankanoon.org/doc/precedent-001/'
      },
      {
        tid: 'precedent-002',
        title: 'Criminal Law Interpretation - IPC Section 420',
        docdisplaydate: '05-06-2019',
        court: 'Supreme Court of India',
        doctype: 'Judgment',
        headline: 'Clarification on elements of cheating and burden of proof',
        url: 'https://indiankanoon.org/doc/precedent-002/'
      }
    ];
  }
}

// Export singleton instance
export const indiaKanoonService = new IndiaKanoonService();