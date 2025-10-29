import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search as SearchIcon,
  Filter,
  Calendar,
  Building2,
  FileText,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { apiService } from "@/lib/apiService";
import { useToast } from "@/hooks/use-toast";

interface IndiaKanoonCase {
  tid: string;
  title: string;
  docdisplaydate: string;
  court: string;
  doctype: string;
  headline: string;
  url: string;
  docsource?: string;
  docsize?: number;
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    court: "",
    jurisdiction: "",
    dateFrom: "",
    dateTo: "",
    documentType: "",
    title: "",
    author: "",
    citation: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeSearch, setActiveSearch] = useState("");
  const [searchResults, setSearchResults] = useState<IndiaKanoonCase[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [displayLimit, setDisplayLimit] = useState(50);
  const { toast } = useToast();

  useEffect(() => {
    if (activeSearch) {
      setCurrentPage(0);
      performSearch(0);
    }
  }, [activeSearch, filters]);

  const performSearch = async (page: number = 0) => {
    setIsLoading(true);
    try {
      const response = await apiService.searchIndiaKanoon({
        query: activeSearch,
        maxResults: 50, // Reduced from 1000 to save API costs - use "Load More" for additional results
        pagenum: page,
        court: filters.court || undefined,
        doctype: filters.documentType || undefined,
        startDate: filters.dateFrom || undefined,
        endDate: filters.dateTo || undefined,
        title: filters.title || undefined,
        author: filters.author || undefined,
        citation: filters.citation || undefined,
      });

      console.log('Search response:', response);
      
      // If loading more pages, append results
      if (page > 0) {
        setSearchResults(prev => [...prev, ...(response.docs || [])]);
      } else {
        setSearchResults(response.docs || []);
      }
      
      setTotalResults(response.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search cases. Please try again.",
        variant: "destructive",
      });
      if (page === 0) {
        setSearchResults([]);
        setTotalResults(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreResults = () => {
    performSearch(currentPage + 1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery);
    }
  };

  const clearFilters = () => {
    setFilters({
      court: "",
      jurisdiction: "",
      dateFrom: "",
      dateTo: "",
      documentType: "",
      title: "",
      author: "",
      citation: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Advanced Case Search</h1>
        <p className="text-muted-foreground">
          Search 1000+ Indian legal cases with advanced filters - Court, Judge, Citation, Date Range & More
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search cases, judgments, citations..."
                  className="pl-12 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <Button type="submit" size="lg" data-testid="button-search">
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-2" variant="secondary">
                    {Object.values(filters).filter(v => v !== "").length}
                  </Badge>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Court</label>
                    <Select value={filters.court} onValueChange={(value) => setFilters({...filters, court: value})}>
                      <SelectTrigger data-testid="select-court">
                        <SelectValue placeholder="Select court" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supremecourt">Supreme Court</SelectItem>
                        <SelectItem value="highcourts">All High Courts</SelectItem>
                        <SelectItem value="delhi">Delhi High Court</SelectItem>
                        <SelectItem value="bombay">Bombay High Court</SelectItem>
                        <SelectItem value="kolkata">Calcutta High Court</SelectItem>
                        <SelectItem value="chennai">Madras High Court</SelectItem>
                        <SelectItem value="allahabad">Allahabad High Court</SelectItem>
                        <SelectItem value="karnataka">Karnataka High Court</SelectItem>
                        <SelectItem value="gujarat">Gujarat High Court</SelectItem>
                        <SelectItem value="punjab">Punjab & Haryana High Court</SelectItem>
                        <SelectItem value="tribunals">All Tribunals</SelectItem>
                        <SelectItem value="delhidc">Delhi District Courts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Document Type</label>
                    <Select value={filters.documentType} onValueChange={(value) => setFilters({...filters, documentType: value})}>
                      <SelectTrigger data-testid="select-document-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="judgments">All Judgments</SelectItem>
                        <SelectItem value="judgment">Judgment</SelectItem>
                        <SelectItem value="order">Order</SelectItem>
                        <SelectItem value="laws">Central Acts & Rules</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">From Date</label>
                    <Input
                      type="text"
                      placeholder="DD-MM-YYYY"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                      data-testid="input-date-from"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">To Date</label>
                    <Input
                      type="text"
                      placeholder="DD-MM-YYYY"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                      data-testid="input-date-to"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Case Title</label>
                    <Input
                      type="text"
                      placeholder="Filter by title..."
                      value={filters.title}
                      onChange={(e) => setFilters({...filters, title: e.target.value})}
                      data-testid="input-title"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Judge/Author</label>
                    <Input
                      type="text"
                      placeholder="Judge name..."
                      value={filters.author}
                      onChange={(e) => setFilters({...filters, author: e.target.value})}
                      data-testid="input-author"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Citation</label>
                    <Input
                      type="text"
                      placeholder="e.g., 2023 AIR"
                      value={filters.citation}
                      onChange={(e) => setFilters({...filters, citation: e.target.value})}
                      data-testid="input-citation"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full"
                      data-testid="button-clear-filters"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {activeSearch && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </span>
              ) : (
                <>
                  Found <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span> results
                </>
              )}
            </p>
          </div>

          {!isLoading && searchResults.length > 0 ? (
            <>
              {searchResults.map((caseItem) => (
                <Card key={caseItem.tid} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {caseItem.tid}
                          </Badge>
                          <Badge variant="secondary">{caseItem.court || caseItem.docsource}</Badge>
                          {caseItem.doctype && (
                            <Badge variant="outline">{caseItem.doctype}</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg mb-2">{caseItem.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {caseItem.docdisplaydate}
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {caseItem.court || caseItem.docsource}
                          </div>
                          {caseItem.docsize && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {Math.round(caseItem.docsize / 1000)}KB
                            </div>
                          )}
                        </div>
                      </div>
                      <a 
                        href={`https://indiankanoon.org/doc/${caseItem.tid}/`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          View on India Kanoon
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </a>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3">{caseItem.headline}</p>
                  </CardContent>
                </Card>
              ))}
              
              {/* Load More Button */}
              {searchResults.length < totalResults && (
                <Card>
                  <CardContent className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Showing {searchResults.length.toLocaleString()} of {totalResults.toLocaleString()} results
                    </p>
                    <Button 
                      onClick={loadMoreResults} 
                      disabled={isLoading}
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading More...
                        </>
                      ) : (
                        <>Load More Results</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : !isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {!activeSearch && (
        <Card>
          <CardContent className="py-12 text-center">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Your Search</h3>
            <p className="text-muted-foreground mb-4">
              Search real Indian legal cases and judgments from India Kanoon
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="cursor-pointer hover-elevate" onClick={() => { setSearchQuery("fundamental rights"); setActiveSearch("fundamental rights"); }}>
                Fundamental Rights
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover-elevate" onClick={() => { setSearchQuery("constitutional law"); setActiveSearch("constitutional law"); }}>
                Constitutional Law
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover-elevate" onClick={() => { setSearchQuery("section 420 ipc"); setActiveSearch("section 420 ipc"); }}>
                Section 420 IPC
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
