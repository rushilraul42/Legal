/**
 * eCourts India Service
 * 
 * Fetches legal case data from official Government of India sources
 * 
 * Official Sources:
 * 1. eCourts Services (https://services.ecourts.gov.in/)
 * 2. Supreme Court API (https://main.sci.gov.in/)
 * 3. National Judicial Data Grid (https://njdg.ecourts.gov.in/)
 * 
 * These are FREE and LEGAL government services
 */

import axios from 'axios';

export interface ECourtCase {
  caseNumber: string;
  caseType: string;
  filingDate: string;
  registrationDate: string;
  petitioner: string;
  respondent: string;
  petitionerAdvocate?: string;
  respondentAdvocate?: string;
  caseStatus: string;
  courtName: string;
  judgeName?: string;
  nextHearingDate?: string;
  purpose?: string;
}

export class ECourtService {
  private baseUrl: string = 'https://services.ecourts.gov.in/ecourtindia_v6';
  
  /**
   * Get case status by CNR number
   * CNR = Case Number Record (unique identifier)
   */
  async getCaseStatusByCNR(cnr: string): Promise<ECourtCase | null> {
    try {
      // Note: This is a placeholder. You need to register at eCourts for API access
      // Registration: https://services.ecourts.gov.in/ecourtindia_v6/
      
      const response = await axios.post(`${this.baseUrl}/case_status`, {
        cnr: cnr
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching case from eCourts:', error);
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
  ): Promise<ECourtCase[]> {
    try {
      // eCourts party name search
      const response = await axios.post(`${this.baseUrl}/search_party`, {
        party_name: partyName,
        state_code: stateCode,
        dist_code: districtCode,
        court_code: courtCode
      });
      
      return response.data.cases || [];
    } catch (error) {
      console.error('Error searching cases:', error);
      return [];
    }
  }
  
  /**
   * Get case history and orders
   */
  async getCaseHistory(
    caseNumber: string,
    caseYear: string,
    stateCode: string,
    districtCode: string
  ): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/case_history`, {
        case_no: caseNumber,
        case_year: caseYear,
        state_code: stateCode,
        dist_code: districtCode
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching case history:', error);
      return null;
    }
  }
}

/**
 * Supreme Court of India Service
 * Fetches data from Supreme Court official website
 */
export class SupremeCourtService {
  private baseUrl: string = 'https://main.sci.gov.in';
  
  /**
   * Search Supreme Court judgments
   * Note: SC website doesn't have official API, but provides bulk downloads
   */
  async searchJudgments(query: string, year?: number): Promise<any[]> {
    try {
      // Supreme Court provides judgment PDFs
      // For bulk access, they provide downloadable databases
      console.log('Supreme Court API integration - requires manual download setup');
      
      return [];
    } catch (error) {
      console.error('Error fetching SC judgments:', error);
      return [];
    }
  }
  
  /**
   * Get case status from Supreme Court
   */
  async getCaseStatus(caseType: string, caseNumber: string, caseYear: string): Promise<any> {
    try {
      // SC website has case status lookup
      const url = `${this.baseUrl}/case_status.php`;
      
      // Note: This requires proper scraping or API access
      return null;
    } catch (error) {
      console.error('Error fetching SC case status:', error);
      return null;
    }
  }
}

/**
 * National Judicial Data Grid Service
 * Statistics and aggregated data
 */
export class NJDGService {
  private baseUrl: string = 'https://njdg.ecourts.gov.in/njdgnew';
  
  /**
   * Get judicial statistics
   */
  async getStatistics(stateCode?: string): Promise<any> {
    try {
      // NJDG provides open data on pending cases, disposal rates, etc.
      const response = await axios.get(`${this.baseUrl}/hcActCases`);
      return response.data;
    } catch (error) {
      console.error('Error fetching NJDG statistics:', error);
      return null;
    }
  }
}

// Export singleton instances
export const eCourtService = new ECourtService();
export const supremeCourtService = new SupremeCourtService();
export const njdgService = new NJDGService();

/**
 * LEGAL ALTERNATIVE TO WEB SCRAPING:
 * 
 * 1. Register for eCourts API Access (FREE):
 *    https://services.ecourts.gov.in/ecourtindia_v6/
 * 
 * 2. Download Supreme Court Bulk Data (FREE):
 *    https://main.sci.gov.in/judgments
 * 
 * 3. Use National Judicial Data Grid (FREE):
 *    https://njdg.ecourts.gov.in/
 * 
 * 4. High Court Websites (Each has their own system):
 *    - Delhi HC: https://delhihighcourt.nic.in/
 *    - Bombay HC: https://bombayhighcourt.nic.in/
 *    - Calcutta HC: https://calcuttahighcourt.nic.in/
 *    - etc.
 * 
 * AVOID: Scraping India Kanoon (violates ToS, illegal)
 * 
 * BEST PRACTICE:
 * - Use official government APIs (free, legal, reliable)
 * - Build local database incrementally
 * - Store judgments in your own database
 * - Index with vector embeddings for search
 */
