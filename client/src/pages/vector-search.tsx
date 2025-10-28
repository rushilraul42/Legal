import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Database,
  Search,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import type { VectorSearchResult } from "@shared/schema";

export default function VectorSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data: results, isLoading } = useQuery<VectorSearchResult[]>({
    queryKey: ["/api/vector-search", activeSearch],
    enabled: !!activeSearch,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery);
    }
  };

  const popularLaws = [
    "Indian Contract Act, 1872",
    "Indian Penal Code, 1860",
    "Constitution of India",
    "Companies Act, 2013",
    "Income Tax Act, 1961",
    "Code of Civil Procedure, 1908",
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Vector Database Search</h1>
        <p className="text-muted-foreground">
          Semantic search through 45+ scraped Indian laws with AI-powered understanding
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search Indian laws and sections semantically..."
                  className="pl-12 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-vector-search"
                />
              </div>
              <Button type="submit" size="lg" data-testid="button-vector-search">
                <Database className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Laws</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45+</div>
            <p className="text-xs text-muted-foreground">Indian Acts indexed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Vector Embeddings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,000+</div>
            <p className="text-xs text-muted-foreground">Sections embedded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Avg. Accuracy</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Relevance score</p>
          </CardContent>
        </Card>
      </div>

      {activeSearch && (
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : results && results.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Found <span className="font-semibold text-foreground">{results.length}</span> relevant sections
              </p>

              {results.map((result) => (
                <Card key={result.id} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{result.section}</Badge>
                          <Badge variant="secondary">{result.metadata.act}</Badge>
                          {result.metadata.year && (
                            <Badge variant="secondary">{result.metadata.year}</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg mb-2">{result.lawName}</CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Relevance:</span>
                          <Progress
                            value={result.relevanceScore * 100}
                            className="h-2 w-32"
                          />
                          <span className="text-xs font-medium">
                            {(result.relevanceScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {result.content}
                    </p>
                    {result.metadata.category && (
                      <div className="mt-4 pt-4 border-t">
                        <Badge variant="outline">{result.metadata.category}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try different search terms or be more specific
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!activeSearch && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Laws</CardTitle>
            <CardDescription>
              Explore commonly referenced Indian laws and acts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {popularLaws.map((law, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg border hover-elevate cursor-pointer"
                  onClick={() => {
                    setSearchQuery(law);
                    setActiveSearch(law);
                  }}
                  data-testid={`popular-law-${index}`}
                >
                  <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{law}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
