import type { LegalCase, JudgmentAnalysis, VectorSearchResult, SearchResult } from "@shared/schema";

export const mockCases: LegalCase[] = [
  {
    id: "case-001",
    caseNumber: "AIR 2023 SC 1234",
    title: "Rajesh Kumar vs. State of Delhi",
    court: "Supreme Court of India",
    date: "2023-03-15",
    judges: ["Justice A.K. Sharma", "Justice R. Banerjee"],
    excerpt: "This landmark judgment deals with the interpretation of Article 21 of the Constitution regarding the right to privacy in the digital age. The court held that privacy is a fundamental right and extends to digital communications and data protection.",
    fullText: "SUPREME COURT OF INDIA\n\nRajesh Kumar ... Petitioner\nvs.\nState of Delhi ... Respondent\n\nJudgment dated: March 15, 2023\n\nThe court examined whether the right to privacy under Article 21 extends to digital communications. After detailed analysis of precedents and constitutional provisions, the court held that privacy is indeed a fundamental right that encompasses digital privacy and data protection.\n\nKey findings:\n1. Privacy is a fundamental right under Article 21\n2. Digital communications are protected\n3. State surveillance must follow due process\n4. Data protection laws are necessary\n\nThe petition is allowed.",
    citations: ["(1954) SCR 158", "AIR 1975 SC 1461", "AIR 2017 SC 4161"],
    jurisdiction: "All India",
    documentType: "Judgment",
    petitioner: "Rajesh Kumar",
    respondent: "State of Delhi",
    verdict: "Petition allowed. The court held that the right to privacy is a fundamental right and extends to digital communications.",
    headnotes: [
      "Constitutional Law - Right to Privacy - Article 21 - Digital communications protected",
      "Fundamental Rights - Privacy extends to digital data and communications",
      "State surveillance requires due process and judicial oversight"
    ],
    relatedCases: ["case-002", "case-003"]
  },
  {
    id: "case-002",
    caseNumber: "AIR 2022 Delhi HC 567",
    title: "ABC Private Limited vs. XYZ Corporation",
    court: "Delhi High Court",
    date: "2022-11-20",
    judges: ["Justice M. Patel"],
    excerpt: "Contract law case examining the enforceability of non-compete clauses in employment contracts. The court held that such clauses must be reasonable in scope and duration to be enforceable.",
    fullText: "DELHI HIGH COURT\n\nABC Private Limited ... Plaintiff\nvs.\nXYZ Corporation ... Defendant\n\nJudgment dated: November 20, 2022\n\nThis case deals with the validity and enforceability of non-compete clauses in employment agreements. The plaintiff sought to enforce a non-compete clause against a former employee who joined a competitor.\n\nThe court analyzed:\n1. Reasonableness of the restriction\n2. Duration of the non-compete period\n3. Geographical scope\n4. Legitimate business interests\n\nHeld: Non-compete clauses are enforceable if they are reasonable in scope, duration, and geography, and protect legitimate business interests. The clause in this case was found to be overly broad and therefore unenforceable.",
    citations: ["AIR 1961 SC 232", "(2008) 4 SCC 190"],
    jurisdiction: "Delhi",
    documentType: "Judgment",
    petitioner: "ABC Private Limited",
    respondent: "XYZ Corporation",
    verdict: "Non-compete clause held unenforceable due to unreasonable scope",
    headnotes: [
      "Contract Law - Non-compete clauses - Must be reasonable to be enforceable",
      "Employment Law - Restraint of trade - Balance between employer and employee rights"
    ],
    relatedCases: ["case-001"]
  },
  {
    id: "case-003",
    caseNumber: "AIR 2023 Bombay HC 890",
    title: "Priya Sharma vs. Municipal Corporation of Mumbai",
    court: "Bombay High Court",
    date: "2023-01-10",
    judges: ["Justice K. Desai", "Justice S. Rao"],
    excerpt: "Property dispute case concerning unauthorized construction and municipal regulations. The court examined the balance between property rights and public interest in urban planning.",
    fullText: "BOMBAY HIGH COURT\n\nPriya Sharma ... Petitioner\nvs.\nMunicipal Corporation of Mumbai ... Respondent\n\nJudgment dated: January 10, 2023\n\nThis writ petition challenges a demolition notice issued by the Municipal Corporation for unauthorized construction. The petitioner claims the construction was authorized and proper procedures were not followed.\n\nIssues:\n1. Whether the construction was unauthorized\n2. Whether proper notice was given\n3. Balance between property rights and public interest\n\nThe court held that while property rights are important, they must be balanced against public interest and urban planning regulations. However, due process must be followed before demolition.",
    citations: ["AIR 1993 SC 1960", "(2011) 2 SCC 752"],
    jurisdiction: "Maharashtra",
    documentType: "Judgment",
    petitioner: "Priya Sharma",
    respondent: "Municipal Corporation of Mumbai",
    verdict: "Partial relief granted. Demolition stayed subject to compliance with regulations",
    headnotes: [
      "Property Law - Unauthorized construction - Balance between rights and regulations",
      "Administrative Law - Due process must be followed in demolition proceedings"
    ],
    relatedCases: ["case-001"]
  },
  {
    id: "case-004",
    caseNumber: "AIR 2022 SC 445",
    title: "State of Karnataka vs. Mohan Industries Ltd.",
    court: "Supreme Court of India",
    date: "2022-08-25",
    judges: ["Justice D. Chandrachud", "Justice B.V. Nagarathna"],
    excerpt: "Environmental law case dealing with industrial pollution and the application of the polluter pays principle. The court emphasized the constitutional duty to protect the environment.",
    jurisdiction: "All India",
    documentType: "Judgment",
    petitioner: "State of Karnataka",
    respondent: "Mohan Industries Ltd.",
    verdict: "Pollution control norms must be strictly enforced. Compensation ordered.",
    headnotes: [
      "Environmental Law - Polluter pays principle - Strict liability for industrial pollution",
      "Constitutional Law - Article 21 includes right to clean environment"
    ]
  },
  {
    id: "case-005",
    caseNumber: "AIR 2023 Madras HC 234",
    title: "Lakshmi Textiles vs. Commissioner of Income Tax",
    court: "Madras High Court",
    date: "2023-05-12",
    judges: ["Justice R. Subramaniam"],
    excerpt: "Tax law case examining the interpretation of deduction provisions under the Income Tax Act. The court clarified the scope of business expenditure deductions.",
    jurisdiction: "Tamil Nadu",
    documentType: "Judgment",
    petitioner: "Lakshmi Textiles",
    respondent: "Commissioner of Income Tax",
    verdict: "Appeal allowed. Deductions properly claimed under Section 37 of Income Tax Act",
    headnotes: [
      "Income Tax Law - Business expenditure - Deduction under Section 37",
      "Taxation - Interpretation of tax statutes - Liberal construction in favor of taxpayer"
    ]
  }
];

export function searchMockCases(query: string, filters: any = {}): SearchResult {
  let results = [...mockCases];

  if (query) {
    const searchTerm = query.toLowerCase();
    results = results.filter(caseItem => 
      caseItem.title.toLowerCase().includes(searchTerm) ||
      caseItem.excerpt.toLowerCase().includes(searchTerm) ||
      caseItem.caseNumber.toLowerCase().includes(searchTerm) ||
      (caseItem.fullText && caseItem.fullText.toLowerCase().includes(searchTerm))
    );
  }

  if (filters.court) {
    const courtMap: Record<string, string> = {
      'supreme': 'Supreme Court',
      'high': 'High Court',
      'district': 'District Court'
    };
    const courtName = courtMap[filters.court] || filters.court;
    results = results.filter(c => c.court.toLowerCase().includes(courtName.toLowerCase()));
  }

  if (filters.jurisdiction && filters.jurisdiction !== 'all') {
    results = results.filter(c => c.jurisdiction.toLowerCase().includes(filters.jurisdiction.toLowerCase()));
  }

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = results.slice(startIndex, endIndex);

  return {
    cases: paginatedResults,
    total: results.length,
    page,
    limit,
    totalPages: Math.ceil(results.length / limit)
  };
}

export function getMockCaseById(id: string): LegalCase | undefined {
  return mockCases.find(c => c.id === id);
}

export function getMockJudgmentAnalysis(documentName: string): JudgmentAnalysis {
  return {
    id: `analysis-${Date.now()}`,
    documentName,
    uploadDate: new Date().toISOString(),
    analysis: {
      summary: "This judgment addresses fundamental questions of constitutional law and statutory interpretation. The court examined the balance between individual rights and state authority, ultimately holding that procedural safeguards must be strictly followed to protect constitutional freedoms.",
      keyPoints: [
        "Constitutional principles must be interpreted liberally to protect fundamental rights",
        "Procedural safeguards cannot be bypassed even in cases of public emergency",
        "The doctrine of proportionality applies to executive actions",
        "Judicial review is essential to maintain checks and balances",
        "International human rights standards inform constitutional interpretation"
      ],
      precedentsFound: [
        {
          caseId: "case-001",
          caseTitle: "Rajesh Kumar vs. State of Delhi",
          relevance: "Establishes the constitutional basis for privacy rights and procedural due process",
          citation: "AIR 2023 SC 1234"
        },
        {
          caseId: "case-004",
          caseTitle: "State of Karnataka vs. Mohan Industries Ltd.",
          relevance: "Relevant for understanding the application of constitutional principles to regulatory matters",
          citation: "AIR 2022 SC 445"
        }
      ],
      legalIssues: [
        "Constitutional Validity",
        "Procedural Due Process",
        "Fundamental Rights",
        "Executive Powers",
        "Judicial Review"
      ],
      recommendations: [
        "Consider filing an appeal if constitutional grounds are strong",
        "Review procedural compliance in detail",
        "Examine precedents from similar jurisdictions",
        "Assess proportionality of the measures challenged",
        "Consider alternative remedies available"
      ],
      sentiment: "Balanced analysis with emphasis on constitutional protections"
    }
  };
}

export const mockVectorResults: VectorSearchResult[] = [
  {
    id: "vec-001",
    lawName: "Indian Contract Act, 1872 - Section 10",
    section: "Section 10",
    content: "What agreements are contracts - All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void.",
    relevanceScore: 0.95,
    metadata: {
      act: "Indian Contract Act",
      year: "1872",
      category: "Contract Law"
    }
  },
  {
    id: "vec-002",
    lawName: "Indian Penal Code, 1860 - Section 420",
    section: "Section 420",
    content: "Cheating and dishonestly inducing delivery of property - Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment for a term which may extend to seven years, and shall also be liable to fine.",
    relevanceScore: 0.88,
    metadata: {
      act: "Indian Penal Code",
      year: "1860",
      category: "Criminal Law"
    }
  },
  {
    id: "vec-003",
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
    id: "vec-004",
    lawName: "Code of Civil Procedure, 1908 - Order 7 Rule 11",
    section: "Order 7 Rule 11",
    content: "Rejection of plaint - The plaint shall be rejected in cases where it does not disclose a cause of action, where the relief claimed is undervalued, or where the suit appears to be barred by any law.",
    relevanceScore: 0.82,
    metadata: {
      act: "Code of Civil Procedure",
      year: "1908",
      category: "Civil Procedure"
    }
  },
  {
    id: "vec-005",
    lawName: "Companies Act, 2013 - Section 166",
    section: "Section 166",
    content: "Duties of directors - A director of a company shall act in good faith in order to promote the objects of the company for the benefit of its members as a whole, and in the best interests of the company, its employees, shareholders, community and for the protection of environment.",
    relevanceScore: 0.79,
    metadata: {
      act: "Companies Act",
      year: "2013",
      category: "Corporate Law"
    }
  }
];

export function searchMockVectorResults(query: string): VectorSearchResult[] {
  if (!query) return mockVectorResults;

  const searchTerm = query.toLowerCase();
  return mockVectorResults.filter(result =>
    result.lawName.toLowerCase().includes(searchTerm) ||
    result.content.toLowerCase().includes(searchTerm) ||
    result.metadata.category.toLowerCase().includes(searchTerm)
  ).sort((a, b) => b.relevanceScore - a.relevanceScore);
}
