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
} from "lucide-react";
import { Link } from "wouter";
import { searchMockCases } from "@/lib/mock-data";
import type { SearchResult } from "@shared/schema";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    court: "",
    jurisdiction: "",
    dateFrom: "",
    dateTo: "",
    documentType: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeSearch, setActiveSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);

  useEffect(() => {
    if (activeSearch) {
      const results = searchMockCases(activeSearch, filters);
      setSearchResults(results);
    }
  }, [activeSearch, filters]);

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
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Case Search</h1>
        <p className="text-muted-foreground">
          Search through 130,000+ legal documents with AI-powered semantic understanding
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 block">Court</label>
                  <Select value={filters.court} onValueChange={(value) => setFilters({...filters, court: value})}>
                    <SelectTrigger data-testid="select-court">
                      <SelectValue placeholder="Select court" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supreme">Supreme Court</SelectItem>
                      <SelectItem value="high">High Court</SelectItem>
                      <SelectItem value="district">District Court</SelectItem>
                      <SelectItem value="tribunal">Tribunal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Jurisdiction</label>
                  <Select value={filters.jurisdiction} onValueChange={(value) => setFilters({...filters, jurisdiction: value})}>
                    <SelectTrigger data-testid="select-jurisdiction">
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                      <SelectItem value="chennai">Chennai</SelectItem>
                      <SelectItem value="all">All India</SelectItem>
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
                      <SelectItem value="judgment">Judgment</SelectItem>
                      <SelectItem value="order">Order</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
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
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {activeSearch && searchResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found <span className="font-semibold text-foreground">{searchResults.total}</span> results
            </p>
          </div>

          {searchResults.cases.length > 0 ? (
            searchResults.cases.map((caseItem) => (
              <Card key={caseItem.id} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {caseItem.caseNumber}
                        </Badge>
                        <Badge variant="secondary">{caseItem.court}</Badge>
                      </div>
                      <CardTitle className="text-lg mb-2">{caseItem.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {caseItem.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {caseItem.jurisdiction}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {caseItem.documentType}
                        </div>
                      </div>
                    </div>
                    <Link href={`/case/${caseItem.id}`}>
                      <Button variant="outline" size="sm" data-testid={`button-view-case-${caseItem.id}`}>
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3">{caseItem.excerpt}</p>
                  {caseItem.judges && caseItem.judges.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Judges:</span> {caseItem.judges.join(", ")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!activeSearch && (
        <Card>
          <CardContent className="py-12 text-center">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Your Search</h3>
            <p className="text-muted-foreground mb-4">
              Enter keywords to search through 130,000+ legal documents
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="cursor-pointer hover-elevate" onClick={() => setSearchQuery("contract law")}>
                Contract Law
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover-elevate" onClick={() => setSearchQuery("property dispute")}>
                Property Dispute
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover-elevate" onClick={() => setSearchQuery("constitutional rights")}>
                Constitutional Rights
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
