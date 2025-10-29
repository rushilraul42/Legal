/**
 * Kleopatra Court API Service
 * 
 * API Documentation: https://court-api.kleopatra.io/
 * 
 * Provides access to Indian court data:
 * - District Courts
 * - High Courts
 * - Supreme Court
 * - Tribunals
 * - Consumer Forums
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface KleopatraCase {
  caseNumber: string;
  caseType: string;
  filingDate: string;
  court: string;
  state: string;
  district: string;
  status: string;
  parties: {
    petitioner: string;
    respondent: string;
  };
  nextHearingDate?: string;
}

export interface KleopatraState {
  stateCode: string;
  stateName: string;
  districtCount: number;
}

export interface KleopatraDistrict {
  districtCode: string;
  districtName: string;
  stateCode: string;
  courtCount: number;
}

export interface KleopatraCourt {
  courtCode: string;
  courtName: string;
  courtType: string;
  districtCode: string;
  stateCode: string;
}

export class KleopatraCourtService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.KLEOPATRA_API_URL || 'https://court-api.kleopatra.io';
    this.apiKey = process.env.KLEOPATRA_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️  Kleopatra API key not configured.');
      console.warn('   Visit https://court-api.kleopatra.io/ to get your API key');
      console.warn('   Add KLEOPATRA_API_KEY to your .env file');
    } else {
      console.log('✅ Kleopatra Court API configured');
    }
  }

  /**
   * Make authenticated request to Kleopatra API
   */
  private async makeRequest<T>(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<T> {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data,
        timeout: 30000
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error('❌ Kleopatra API: Invalid API key');
      } else if (error.response?.status === 403) {
        console.error('❌ Kleopatra API: Access forbidden - check subscription');
      } else if (error.response?.status === 429) {
        console.error('❌ Kleopatra API: Rate limit exceeded');
      }
      throw error;
    }
  }

  // ============================================
  // Static Data APIs (Master Data)
  // ============================================

  /**
   * Get all states with district courts
   */
  async getAllStates(): Promise<KleopatraState[]> {
    try {
      return await this.makeRequest<KleopatraState[]>(
        '/api/core/static/district-court/states'
      );
    } catch (error) {
      console.error('Error fetching states:', error);
      return [];
    }
  }

  /**
   * Get districts for a specific state
   */
  async getDistricts(stateCode: string): Promise<KleopatraDistrict[]> {
    try {
      return await this.makeRequest<KleopatraDistrict[]>(
        `/api/core/static/district-court/districts/${stateCode}`
      );
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  }

  /**
   * Get court complexes
   */
  async getComplexes(stateCode: string, districtCode: string): Promise<any[]> {
    try {
      return await this.makeRequest<any[]>(
        `/api/core/static/district-court/complexes/${stateCode}/${districtCode}`
      );
    } catch (error) {
      console.error('Error fetching complexes:', error);
      return [];
    }
  }

  /**
   * Get courts in a complex
   */
  async getCourts(stateCode: string, districtCode: string, complexCode: string): Promise<KleopatraCourt[]> {
    try {
      return await this.makeRequest<KleopatraCourt[]>(
        `/api/core/static/district-court/courts/${stateCode}/${districtCode}/${complexCode}`
      );
    } catch (error) {
      console.error('Error fetching courts:', error);
      return [];
    }
  }

  // ============================================
  // Live Data APIs (Real-time Case Data)
  // ============================================

  /**
   * Search cases by CNR (Case Number Record)
   */
  async searchByCNR(cnr: string): Promise<KleopatraCase | null> {
    try {
      return await this.makeRequest<KleopatraCase>(
        '/api/core/live/district-court/case-by-cnr',
        'POST',
        { cnr }
      );
    } catch (error) {
      console.error('Error searching by CNR:', error);
      return null;
    }
  }

  /**
   * Search cases by party name
   */
  async searchByPartyName(
    partyName: string,
    stateCode: string,
    districtCode: string,
    courtCode: string
  ): Promise<KleopatraCase[]> {
    try {
      return await this.makeRequest<KleopatraCase[]>(
        '/api/core/live/district-court/search-by-party',
        'POST',
        {
          party_name: partyName,
          state_code: stateCode,
          district_code: districtCode,
          court_code: courtCode
        }
      );
    } catch (error) {
      console.error('Error searching by party name:', error);
      return [];
    }
  }

  /**
   * Search cases by case number
   */
  async searchByCaseNumber(
    caseNumber: string,
    caseYear: string,
    stateCode: string,
    districtCode: string,
    courtCode: string
  ): Promise<KleopatraCase[]> {
    try {
      return await this.makeRequest<KleopatraCase[]>(
        '/api/core/live/district-court/search-by-case-number',
        'POST',
        {
          case_number: caseNumber,
          case_year: caseYear,
          state_code: stateCode,
          district_code: districtCode,
          court_code: courtCode
        }
      );
    } catch (error) {
      console.error('Error searching by case number:', error);
      return [];
    }
  }

  /**
   * Get case history and orders
   */
  async getCaseHistory(cnr: string): Promise<any> {
    try {
      return await this.makeRequest<any>(
        '/api/core/live/district-court/case-history',
        'POST',
        { cnr }
      );
    } catch (error) {
      console.error('Error fetching case history:', error);
      return null;
    }
  }

  /**
   * Get daily cause list
   */
  async getDailyCauseList(
    stateCode: string,
    districtCode: string,
    courtCode: string,
    date: string // Format: YYYY-MM-DD
  ): Promise<any[]> {
    try {
      return await this.makeRequest<any[]>(
        '/api/core/live/district-court/cause-list',
        'POST',
        {
          state_code: stateCode,
          district_code: districtCode,
          court_code: courtCode,
          date
        }
      );
    } catch (error) {
      console.error('Error fetching cause list:', error);
      return [];
    }
  }

  // ============================================
  // High Court APIs
  // ============================================

  /**
   * Get High Court states
   */
  async getHighCourtStates(): Promise<any[]> {
    try {
      return await this.makeRequest<any[]>(
        '/api/core/static/high-court/states'
      );
    } catch (error) {
      console.error('Error fetching HC states:', error);
      return [];
    }
  }

  /**
   * Search High Court cases
   */
  async searchHighCourtCases(params: {
    stateCode: string;
    searchType: 'cnr' | 'party' | 'case_number';
    searchValue: string;
  }): Promise<any[]> {
    try {
      return await this.makeRequest<any[]>(
        '/api/core/live/high-court/search',
        'POST',
        params
      );
    } catch (error) {
      console.error('Error searching HC cases:', error);
      return [];
    }
  }

  // ============================================
  // Supreme Court APIs
  // ============================================

  /**
   * Search Supreme Court cases
   */
  async searchSupremeCourtCases(params: {
    searchType: 'diary' | 'case_number' | 'party';
    searchValue: string;
  }): Promise<any[]> {
    try {
      return await this.makeRequest<any[]>(
        '/api/core/live/supreme-court/search',
        'POST',
        params
      );
    } catch (error) {
      console.error('Error searching SC cases:', error);
      return [];
    }
  }

  /**
   * Get Supreme Court case status
   */
  async getSupremeCourtCaseStatus(diaryNumber: string): Promise<any> {
    try {
      return await this.makeRequest<any>(
        '/api/core/live/supreme-court/case-status',
        'POST',
        { diary_number: diaryNumber }
      );
    } catch (error) {
      console.error('Error fetching SC case status:', error);
      return null;
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Test API connection
   */
  async testConnection(): Promise<{
    isConnected: boolean;
    hasValidKey: boolean;
    message: string;
  }> {
    try {
      const states = await this.getAllStates();
      
      if (states.length > 0) {
        return {
          isConnected: true,
          hasValidKey: true,
          message: `Kleopatra API connected successfully. Found ${states.length} states.`
        };
      }
      
      return {
        isConnected: true,
        hasValidKey: true,
        message: 'Connected but no data returned'
      };
    } catch (error: any) {
      return {
        isConnected: false,
        hasValidKey: false,
        message: error.response?.status === 401 ? 'Invalid API key' : error.message
      };
    }
  }

  /**
   * Get service status
   */
  getServiceStatus(): {
    name: string;
    configured: boolean;
    hasApiKey: boolean;
    message: string;
  } {
    return {
      name: 'Kleopatra Court API',
      configured: !!this.apiKey,
      hasApiKey: !!this.apiKey,
      message: this.apiKey
        ? 'API key configured - ready for court data access'
        : 'No API key - visit https://court-api.kleopatra.io/ to get one'
    };
  }
}

// Export singleton instance
export const kleopatraCourtService = new KleopatraCourtService();

/**
 * USAGE IN YOUR APPLICATION:
 * 
 * 1. Get API Key:
 *    - Visit: https://court-api.kleopatra.io/
 *    - Click "Log In" and create account
 *    - Copy your Bearer token
 * 
 * 2. Add to .env:
 *    KLEOPATRA_API_KEY=your_bearer_token_here
 * 
 * 3. Use in your app:
 *    import { kleopatraCourtService } from './services/kleopatraCourtService';
 *    
 *    // Get all states
 *    const states = await kleopatraCourtService.getAllStates();
 *    
 *    // Search cases
 *    const cases = await kleopatraCourtService.searchByCNR('DLCT01-123456-2023');
 * 
 * BENEFITS:
 * - Real-time case status
 * - Daily cause lists
 * - Case history
 * - All Indian courts covered
 * - May be cheaper than India Kanoon
 */
