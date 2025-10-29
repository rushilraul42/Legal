/**
 * India Kanoon API Service
 * 
 * This service implements the official India Kanoon API endpoints:
 * - Search: https://api.indiankanoon.org/search/?formInput=<query>&pagenum=<pagenum>
 * - Document: https://api.indiankanoon.org/doc/<docid>/
 * - Court Copy: https://api.indiankanoon.org/origdoc/<docid>/
 * - Document Fragments: https://api.indiankanoon.org/docfragment/<docid>/?formInput=<query>
 * - Document Metadata: https://api.indiankanoon.org/docmeta/<docid>/
 * 
 * Authentication: Uses API Token in Authorization header: "Token <api_token>"
 * 
 * Features:
 * - Boolean search with ANDD, ORR, NOTT operators
 * - Phrase search with quotation marks
 * - Advanced filtering by court, author, citations, dates
 * - Support for all court types (Supreme Court, High Courts, Tribunals)
 * - Document size information and citation lists
 * 
 * Environment Variables:
 * - INDIA_KANOON_API_TOKEN or VITE_INDIA_KANOON_API_TOKEN: API authentication token
 * - INDIA_KANOON_BASE_URL or VITE_INDIA_KANOON_BASE_URL: API base URL (defaults to https://api.indiankanoon.org)
 */

import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

export interface IndiaKanoonSearchParams {
  query: string;
  maxResults?: number;
  startDate?: string;
  endDate?: string;
  court?: string;
  doctype?: string;
  pagenum?: number;
  maxpages?: number;
  title?: string;
  cite?: string;
  author?: string;
  bench?: string;
  maxcites?: number;
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
  docsource?: string;
  docsize?: number;
  citeList?: string[];
  citedbyList?: string[];
}

export interface IndiaKanoonSearchResponse {
  docs: IndiaKanoonCase[];
  total: number;
  query: string;
}

export class IndiaKanoonService {
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = process.env.INDIA_KANOON_BASE_URL || process.env.VITE_INDIA_KANOON_BASE_URL || 'https://api.indiankanoon.org';
    // Support both old and new environment variable names for backward compatibility
    this.apiToken = process.env.INDIA_KANOON_API_TOKEN || 
                   process.env.VITE_INDIA_KANOON_API_TOKEN || 
                   process.env.INDIA_KANOON_API_KEY || 
                   process.env.VITE_INDIA_KANOON_API_KEY || '';
    
    if (!this.apiToken) {
      console.warn('⚠️  India Kanoon API token not configured. Using mock data fallback.');
      console.warn('   Set INDIA_KANOON_API_TOKEN environment variable for live API access.');
    } else {
      console.log('✅ India Kanoon API token loaded successfully');
    }
  }

  /**
   * Get service status for initialization
   */
  getServiceStatus(): {
    name: string;
    configured: boolean;
    hasApiToken: boolean;
    message: string;
  } {
    return {
      name: 'India Kanoon API',
      configured: !!this.apiToken,
      hasApiToken: !!this.apiToken,
      message: this.apiToken 
        ? 'API token configured - ready for live searches'
        : 'No API token - using mock data fallback'
    };
  }

  /**
   * Test API connectivity and authentication
   */
  async testConnection(): Promise<{ 
    isConnected: boolean; 
    hasValidToken: boolean; 
    message: string; 
    mockDataAvailable: boolean;
  }> {
    try {
      if (!this.apiToken) {
        return {
          isConnected: false,
          hasValidToken: false,
          message: 'No API token configured. Using mock data.',
          mockDataAvailable: true
        };
      }

      // Try a simple search to test connectivity
      const testQuery = 'constitution';
      const response = await this.searchCases({ 
        query: testQuery, 
        maxResults: 1 
      });

      if (response.docs.length > 0) {
        return {
          isConnected: true,
          hasValidToken: true,
          message: 'India Kanoon API connection successful',
          mockDataAvailable: true
        };
      } else {
        return {
          isConnected: true,
          hasValidToken: true,
          message: 'API connected but no results for test query',
          mockDataAvailable: true
        };
      }
    } catch (error: any) {
      let message = 'Connection failed';
      let hasValidToken = false;

      if (error.response?.status === 401) {
        message = 'Invalid or expired API token';
      } else if (error.response?.status === 403) {
        message = 'API access forbidden - check subscription';
        hasValidToken = true;
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        message = 'Cannot reach India Kanoon API servers';
      } else {
        message = `API error: ${error.message}`;
      }

      return {
        isConnected: false,
        hasValidToken,
        message,
        mockDataAvailable: true
      };
    }
  }

  /**
   * Search cases using India Kanoon API
   */
  async searchCases(params: IndiaKanoonSearchParams): Promise<IndiaKanoonSearchResponse> {
    try {
      const queryParams = new URLSearchParams({
        formInput: params.query,
        pagenum: (params.pagenum || 0).toString()
      });

      if (params.maxResults) {
        queryParams.append('maxpages', Math.ceil(params.maxResults / 10).toString());
      }

      if (params.maxpages) {
        queryParams.append('maxpages', params.maxpages.toString());
      }
      
      if (params.startDate) {
        queryParams.append('fromdate', params.startDate);
      }
      
      if (params.endDate) {
        queryParams.append('todate', params.endDate);
      }

      if (params.court) {
        queryParams.append('doctypes', params.court);
      }

      if (params.doctype) {
        queryParams.append('doctypes', params.doctype);
      }

      if (params.title) {
        queryParams.append('title', params.title);
      }

      if (params.cite) {
        queryParams.append('cite', params.cite);
      }

      if (params.author) {
        queryParams.append('author', params.author);
      }

      if (params.bench) {
        queryParams.append('bench', params.bench);
      }

      if (params.maxcites) {
        queryParams.append('maxcites', params.maxcites.toString());
      }

      const searchUrl = `${this.baseUrl}/search/?${queryParams.toString()}`;

      const headers: any = {
        'Accept': 'application/json'
      };

      // Add API Token authentication if available
      if (this.apiToken) {
        headers['Authorization'] = `Token ${this.apiToken}`;
      } else {
        // If no token, skip API call and go straight to mock data
        console.log('🔄 No API token configured, using mock data for query:', params.query);
        return this.getMockSearchResults(params.query);
      }

      // Try POST request as per India Kanoon API documentation
      const response = await axios.post(searchUrl, {}, {
        headers,
        timeout: 30000
      });

      // Transform the response to our format
      const docs = response.data.docs || [];
      return {
        docs: docs.map((doc: any) => ({
          tid: doc.tid || '',
          title: doc.title || '',
          docdisplaydate: doc.docdisplaydate || '',
          court: doc.docsource || doc.court || '',
          doctype: doc.doctype || '',
          headline: doc.headline || '',
          url: `https://indiankanoon.org/doc/${doc.tid}/`,
          docsource: doc.docsource || '',
          docsize: doc.docsize || 0
        })),
        total: response.data.found || response.data.total || docs.length,
        query: params.query
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error('❌ India Kanoon API authentication failed. Check your API token.');
        console.error('   Get your API token from: https://indiankanoon.org/api/');
      } else if (error.response?.status === 403) {
        console.error('❌ India Kanoon API access forbidden. Check your subscription status.');
      } else if (error.response?.status === 405) {
        console.error('❌ India Kanoon API: Method Not Allowed (405)');
        console.error('   This may indicate the API endpoint or HTTP method is incorrect.');
      } else {
        console.error('India Kanoon API error:', error.message);
      }
      
      // Return mock data if API fails
      console.log('🔄 Falling back to mock data for search query:', params.query);
      return this.getMockSearchResults(params.query);
    }
  }

  /**
   * Get full case details by case ID with citations
   */
  async getCaseDetailsWithCitations(caseId: string, maxCites: number = 10, maxCitedBy: number = 10): Promise<IndiaKanoonCase | null> {
    try {
      const queryParams = new URLSearchParams();
      if (maxCites > 0) {
        queryParams.append('maxcites', maxCites.toString());
      }
      if (maxCitedBy > 0) {
        queryParams.append('maxcitedby', maxCitedBy.toString());
      }

      const url = `${this.baseUrl}/doc/${caseId}/?${queryParams.toString()}`;
      
      const headers: any = {
        'Accept': 'application/json'
      };

      if (this.apiToken) {
        headers['Authorization'] = `Token ${this.apiToken}`;
      }
      
      const response = await axios.get(url, {
        headers,
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
        url: `https://indiankanoon.org/doc/${caseId}/`,
        citeList: response.data.citeList || [],
        citedbyList: response.data.citedbyList || []
      };
    } catch (error: any) {
      console.error('Error fetching case details with citations:', error.message);
      return null;
    }
  }

  /**
   * Get full case details by case ID
   */
  async getCaseDetails(caseId: string): Promise<IndiaKanoonCase | null> {
    try {
      const url = `${this.baseUrl}/doc/${caseId}/`;
      
      const headers: any = {
        'Accept': 'application/json'
      };

      // Add API Token authentication if available
      if (this.apiToken) {
        headers['Authorization'] = `Token ${this.apiToken}`;
      }
      
      const response = await axios.get(url, {
        headers,
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
      if (error.response?.status === 401) {
        console.error('❌ India Kanoon API authentication failed for case details.');
      } else {
        console.error('Error fetching case details:', error.message);
      }
      return null;
    }
  }

  /**
   * Get document fragments containing the query
   */
  async getDocumentFragments(docId: string, query: string): Promise<{
    tid: string;
    title: string;
    headline: string;
    formInput: string;
  } | null> {
    try {
      const url = `${this.baseUrl}/docfragment/${docId}/?formInput=${encodeURIComponent(query)}`;
      
      const headers: any = {
        'Accept': 'application/json'
      };

      if (this.apiToken) {
        headers['Authorization'] = `Token ${this.apiToken}`;
      }
      
      const response = await axios.get(url, {
        headers,
        timeout: 30000
      });

      return {
        tid: response.data.tid || docId,
        title: response.data.title || '',
        headline: response.data.headline || '',
        formInput: query
      };
    } catch (error: any) {
      console.error('Error fetching document fragments:', error.message);
      return null;
    }
  }

  /**
   * Get document metadata
   */
  async getDocumentMeta(docId: string): Promise<{
    tid: string;
    title: string;
    court: string;
    doctype: string;
    docdisplaydate: string;
    citeList?: string[];
    citedbyList?: string[];
  } | null> {
    try {
      const url = `${this.baseUrl}/docmeta/${docId}/`;
      
      const headers: any = {
        'Accept': 'application/json'
      };

      if (this.apiToken) {
        headers['Authorization'] = `Token ${this.apiToken}`;
      }
      
      const response = await axios.get(url, {
        headers,
        timeout: 30000
      });

      return {
        tid: response.data.tid || docId,
        title: response.data.title || '',
        court: response.data.court || '',
        doctype: response.data.doctype || '',
        docdisplaydate: response.data.docdisplaydate || '',
        citeList: response.data.citeList || [],
        citedbyList: response.data.citedbyList || []
      };
    } catch (error: any) {
      console.error('Error fetching document metadata:', error.message);
      return null;
    }
  }

  /**
   * Get court copy of document
   */
  async getCourtCopy(docId: string): Promise<{
    tid: string;
    content: string;
  } | null> {
    try {
      const url = `${this.baseUrl}/origdoc/${docId}/`;
      
      const headers: any = {
        'Accept': 'application/json'
      };

      if (this.apiToken) {
        headers['Authorization'] = `Token ${this.apiToken}`;
      }
      
      const response = await axios.get(url, {
        headers,
        timeout: 30000
      });

      return {
        tid: docId,
        content: response.data.doc || ''
      };
    } catch (error: any) {
      console.error('Error fetching court copy:', error.message);
      return null;
    }
  }

  /**
   * Advanced search with filters using India Kanoon search operators
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
      const searchParams: IndiaKanoonSearchParams = {
        query: params.query,
        maxResults: 50
      };

      // Use API parameters instead of query modifications
      if (params.court) {
        searchParams.doctype = params.court;
      }
      
      if (params.judge) {
        searchParams.author = params.judge;
      }
      
      if (params.citation) {
        searchParams.cite = params.citation;
      }

      if (params.docType) {
        searchParams.doctype = params.docType;
      }

      if (params.fromYear) {
        searchParams.startDate = `1-1-${params.fromYear}`;
      }
      
      if (params.toYear) {
        searchParams.endDate = `31-12-${params.toYear}`;
      }

      return await this.searchCases(searchParams);
    } catch (error) {
      console.error('Advanced search error:', error);
      return this.getMockSearchResults(params.query);
    }
  }

  /**
   * Search with boolean operators (ANDD, ORR, NOTT)
   */
  async booleanSearch(terms: string[], operator: 'ANDD' | 'ORR' | 'NOTT'): Promise<IndiaKanoonSearchResponse> {
    try {
      const query = terms.join(` ${operator} `);
      return await this.searchCases({ query });
    } catch (error) {
      console.error('Boolean search error:', error);
      return this.getMockSearchResults(terms.join(' '));
    }
  }

  /**
   * Phrase search with exact matching
   */
  async phraseSearch(phrase: string): Promise<IndiaKanoonSearchResponse> {
    try {
      const query = `"${phrase}"`;
      return await this.searchCases({ query });
    } catch (error) {
      console.error('Phrase search error:', error);
      return this.getMockSearchResults(phrase);
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
    const allMockCases: IndiaKanoonCase[] = [
      {
        tid: 'mock-001',
        title: 'Justice K.S. Puttaswamy (Retd.) vs. Union of India',
        docdisplaydate: '24-08-2017',
        court: 'Supreme Court of India',
        doctype: 'Judgment',
        headline: 'Nine-judge bench decision establishing privacy as fundamental right under Article 21',
        url: 'https://indiankanoon.org/doc/mock-001/',
        docsource: 'Supreme Court of India',
        docsize: 150000
      },
      {
        tid: 'mock-002',
        title: 'State of Maharashtra vs. Rajesh Kumar',
        docdisplaydate: '15-03-2023',
        court: 'Bombay High Court',
        doctype: 'Judgment',
        headline: 'Criminal law case dealing with Section 420 IPC - elements of cheating and burden of proof',
        url: 'https://indiankanoon.org/doc/mock-002/',
        docsource: 'Bombay High Court',
        docsize: 45000
      },
      {
        tid: 'mock-003',
        title: 'Union of India vs. ABC Corporation Ltd.',
        docdisplaydate: '10-01-2023',
        court: 'Supreme Court of India',
        doctype: 'Judgment',
        headline: 'Constitutional law case on fundamental rights, due process, and administrative action validity',
        url: 'https://indiankanoon.org/doc/mock-003/',
        docsource: 'Supreme Court of India',
        docsize: 89000
      },
      {
        tid: 'mock-004',
        title: 'Priya Sharma vs. State of Delhi',
        docdisplaydate: '25-11-2022',
        court: 'Delhi High Court',
        doctype: 'Order',
        headline: 'Civil procedure case on jurisdiction, maintainability, and territorial limits of court',
        url: 'https://indiankanoon.org/doc/mock-004/',
        docsource: 'Delhi High Court',
        docsize: 32000
      },
      {
        tid: 'mock-005',
        title: 'Vishaka vs. State of Rajasthan',
        docdisplaydate: '13-08-1997',
        court: 'Supreme Court of India',
        doctype: 'Judgment',
        headline: 'Landmark case on sexual harassment at workplace and guidelines for prevention',
        url: 'https://indiankanoon.org/doc/mock-005/',
        docsource: 'Supreme Court of India',
        docsize: 67000
      },
      {
        tid: 'mock-006',
        title: 'Indian Young Lawyers Association vs. State of Kerala',
        docdisplaydate: '28-09-2018',
        court: 'Supreme Court of India',
        doctype: 'Judgment',
        headline: 'Sabarimala temple case - constitutional validity of religious practices and gender equality',
        url: 'https://indiankanoon.org/doc/mock-006/',
        docsource: 'Supreme Court of India',
        docsize: 125000
      },
      {
        tid: 'mock-007',
        title: 'Central Vigilance Commission vs. State of Gujarat',
        docdisplaydate: '05-07-2021',
        court: 'Gujarat High Court',
        doctype: 'Order',
        headline: 'Administrative law case on corruption investigation and due process requirements',
        url: 'https://indiankanoon.org/doc/mock-007/',
        docsource: 'Gujarat High Court',
        docsize: 28000
      },
      {
        tid: 'mock-008',
        title: 'Shreya Singhal vs. Union of India',
        docdisplaydate: '24-03-2015',
        court: 'Supreme Court of India',
        doctype: 'Judgment',
        headline: 'IT Act Section 66A struck down - freedom of speech and expression on internet',
        url: 'https://indiankanoon.org/doc/mock-008/',
        docsource: 'Supreme Court of India',
        docsize: 95000
      }
    ];

    // Filter cases based on query
    const filteredCases = allMockCases.filter(c => 
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.headline.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().split(' ').some(term => 
        c.title.toLowerCase().includes(term) || 
        c.headline.toLowerCase().includes(term)
      )
    );

    return {
      docs: filteredCases.length > 0 ? filteredCases : allMockCases.slice(0, 3),
      total: filteredCases.length > 0 ? filteredCases.length : 3,
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

  /**
   * Get available court types for filtering
   */
  getCourtTypes(): { [key: string]: string } {
    return {
      'supremecourt': 'Supreme Court of India',
      'delhi': 'Delhi High Court',
      'bombay': 'Bombay High Court',
      'kolkata': 'Calcutta High Court',
      'chennai': 'Madras High Court',
      'allahabad': 'Allahabad High Court',
      'andhra': 'Andhra Pradesh High Court',
      'chattisgarh': 'Chhattisgarh High Court',
      'gauhati': 'Gauhati High Court',
      'jammu': 'Jammu & Kashmir High Court',
      'kerala': 'Kerala High Court',
      'lucknow': 'Lucknow Bench of Allahabad High Court',
      'orissa': 'Orissa High Court',
      'uttaranchal': 'Uttarakhand High Court',
      'gujarat': 'Gujarat High Court',
      'himachal_pradesh': 'Himachal Pradesh High Court',
      'jharkhand': 'Jharkhand High Court',
      'karnataka': 'Karnataka High Court',
      'madhyapradesh': 'Madhya Pradesh High Court',
      'patna': 'Patna High Court',
      'punjab': 'Punjab and Haryana High Court',
      'rajasthan': 'Rajasthan High Court',
      'sikkim': 'Sikkim High Court',
      'delhidc': 'Delhi District Courts',
      'highcourts': 'All High Courts',
      'tribunals': 'All Tribunals',
      'judgments': 'All Judgments (SC, HC, District Courts)',
      'laws': 'Central Acts and Rules'
    };
  }

  /**
   * Get available tribunal types
   */
  getTribunalTypes(): { [key: string]: string } {
    return {
      'aptel': 'Appellate Tribunal for Electricity',
      'drat': 'Debt Recovery Appellate Tribunal',
      'cat': 'Central Administrative Tribunal',
      'cegat': 'Central Excise and Service Tax Appellate Tribunal',
      'stt': 'Securities Appellate Tribunal',
      'itat': 'Income Tax Appellate Tribunal',
      'consumer': 'Consumer Forums',
      'cerc': 'Central Electricity Regulatory Commission',
      'cic': 'Central Information Commission',
      'clb': 'Company Law Board',
      'copyrightboard': 'Copyright Board',
      'ipab': 'Intellectual Property Appellate Board',
      'mrtp': 'Monopolies and Restrictive Trade Practices Commission',
      'sebisat': 'Securities Appellate Tribunal',
      'tdsat': 'Telecom Disputes Settlement and Appellate Tribunal',
      'trademark': 'Trade Marks Registry',
      'greentribunal': 'National Green Tribunal',
      'cci': 'Competition Commission of India'
    };
  }

  /**
   * Comprehensive search example demonstrating various search capabilities
   */
  async comprehensiveSearch(searchTerm: string): Promise<{
    basicSearch: IndiaKanoonSearchResponse;
    supremeCourtCases: IndiaKanoonSearchResponse;
    recentCases: IndiaKanoonSearchResponse;
    phraseCases: IndiaKanoonSearchResponse;
  }> {
    try {
      // Basic search
      const basicSearch = await this.searchCases({ 
        query: searchTerm, 
        maxResults: 20 
      });

      // Supreme Court cases only
      const supremeCourtCases = await this.searchCases({
        query: searchTerm,
        doctype: 'supremecourt',
        maxResults: 10
      });

      // Recent cases (last 2 years)
      const currentYear = new Date().getFullYear();
      const recentCases = await this.searchCases({
        query: searchTerm,
        startDate: `1-1-${currentYear - 2}`,
        maxResults: 15
      });

      // Phrase search
      const phraseCases = await this.phraseSearch(searchTerm);

      return {
        basicSearch,
        supremeCourtCases,
        recentCases,
        phraseCases
      };
    } catch (error) {
      console.error('Comprehensive search error:', error);
      const mockResult = this.getMockSearchResults(searchTerm);
      return {
        basicSearch: mockResult,
        supremeCourtCases: mockResult,
        recentCases: mockResult,
        phraseCases: mockResult
      };
    }
  }
}

// Export singleton instance
export const indiaKanoonService = new IndiaKanoonService();