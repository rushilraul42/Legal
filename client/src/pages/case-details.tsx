import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Building2,
  FileText,
  Scale,
  ArrowLeft,
  Bookmark,
  Share2,
  Download,
  Users,
  Gavel,
} from "lucide-react";
import { Link } from "wouter";
import type { LegalCase } from "@shared/schema";

export default function CaseDetails() {
  const [, params] = useRoute("/case/:id");
  const caseId = params?.id;

  const { data: caseData, isLoading } = useQuery<LegalCase>({
    queryKey: ["/api/case", caseId],
    enabled: !!caseId,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Case Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The case you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/search">
              <Button>Back to Search</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/search">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <Badge variant="outline" className="font-mono mb-2">
            {caseData.caseNumber}
          </Badge>
          <h1 className="text-3xl font-semibold">{caseData.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Court</p>
                <p className="text-sm font-medium">{caseData.court}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{caseData.date}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jurisdiction</p>
                <p className="text-sm font-medium">{caseData.jurisdiction}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium">{caseData.documentType}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fulltext">Full Text</TabsTrigger>
          <TabsTrigger value="citations">Citations</TabsTrigger>
          {caseData.relatedCases && caseData.relatedCases.length > 0 && (
            <TabsTrigger value="related">Related Cases</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{caseData.excerpt}</p>
            </CardContent>
          </Card>

          {caseData.petitioner && caseData.respondent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Petitioner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{caseData.petitioner}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Respondent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{caseData.respondent}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {caseData.judges && caseData.judges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Judges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {caseData.judges.map((judge, index) => (
                    <Badge key={index} variant="secondary">
                      {judge}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {caseData.verdict && (
            <Card>
              <CardHeader>
                <CardTitle>Verdict</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{caseData.verdict}</p>
              </CardContent>
            </Card>
          )}

          {caseData.headnotes && caseData.headnotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Headnotes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {caseData.headnotes.map((note, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm">{note}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fulltext">
          <Card>
            <CardHeader>
              <CardTitle>Full Judgment Text</CardTitle>
              <CardDescription>Complete text of the legal judgment</CardDescription>
            </CardHeader>
            <CardContent>
              {caseData.fullText ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {caseData.fullText}
                  </pre>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Full text not available for this case. {caseData.excerpt}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="citations">
          <Card>
            <CardHeader>
              <CardTitle>Citations & References</CardTitle>
              <CardDescription>
                Legal citations referenced in this judgment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {caseData.citations && caseData.citations.length > 0 ? (
                <div className="space-y-3">
                  {caseData.citations.map((citation, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border hover-elevate"
                    >
                      <Badge variant="outline" className="font-mono mb-2">
                        Citation {index + 1}
                      </Badge>
                      <p className="text-sm">{citation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No citations available for this case.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {caseData.relatedCases && caseData.relatedCases.length > 0 && (
          <TabsContent value="related">
            <Card>
              <CardHeader>
                <CardTitle>Related Cases</CardTitle>
                <CardDescription>
                  Similar cases and precedents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caseData.relatedCases.map((relatedId, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border hover-elevate cursor-pointer"
                      onClick={() => window.location.href = `/case/${relatedId}`}
                    >
                      <p className="text-sm font-medium">Related Case: {relatedId}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
