import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  CheckCircle2,
  Scale,
  Lightbulb,
  AlertCircle,
  Copy,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { JudgmentAnalysis } from "@shared/schema";
import { getMockJudgmentAnalysis } from "@/lib/mock-data";

export default function Analysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysis, setAnalysis] = useState<JudgmentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.type.includes("document")) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or document file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (selectedFile) {
      setIsAnalyzing(true);
      
      setTimeout(() => {
        const mockAnalysis = getMockJudgmentAnalysis(selectedFile.name);
        setAnalysis(mockAnalysis);
        setIsAnalyzing(false);
        toast({
          title: "Analysis Complete",
          description: "Your judgment has been analyzed successfully.",
        });
      }, 2000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Content has been copied to your clipboard.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">AI Judgment Analysis</h1>
        <p className="text-muted-foreground">
          Upload legal documents for instant AI-powered analysis with precedent matching
        </p>
      </div>

      {!analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload a PDF or document file for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={
                  "relative border-2 border-dashed rounded-lg p-12 text-center transition-colors " +
                  (dragActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50")
                }
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  data-testid="input-file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm font-medium mb-1">
                    {selectedFile ? selectedFile.name : "Drop your document here, or click to browse"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, DOC, DOCX (Max 10MB)
                  </p>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      data-testid="button-remove-file"
                    >
                      Remove
                    </Button>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    data-testid="button-analyze"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Document"}
                  </Button>

                  {isAnalyzing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Analyzing document...</span>
                        <span className="font-medium">Processing</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What We Analyze</CardTitle>
              <CardDescription>
                Our AI extracts key insights from your legal documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Summary & Key Points</h4>
                  <p className="text-sm text-muted-foreground">
                    Concise summary with extracted key legal points
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Precedents Found</h4>
                  <p className="text-sm text-muted-foreground">
                    Relevant case precedents with citations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Legal Issues</h4>
                  <p className="text-sm text-muted-foreground">
                    Identified legal issues and considerations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Recommendations</h4>
                  <p className="text-sm text-muted-foreground">
                    AI-generated recommendations and next steps
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Analysis Results</h2>
              <p className="text-sm text-muted-foreground">{analysis.documentName}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAnalysis(null)} data-testid="button-new-analysis">
                New Analysis
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Summary</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(analysis.analysis.summary)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{analysis.analysis.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Key Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.analysis.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Precedents Found
              </CardTitle>
              <CardDescription>
                Relevant case precedents identified in the document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.analysis.precedentsFound.map((precedent, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="font-medium">{precedent.caseTitle}</h4>
                    <Badge variant="outline" className="font-mono text-xs">
                      {precedent.citation}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {precedent.relevance}
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-primary hover:text-primary/80" asChild>
                    <a href={`/case/${precedent.caseId}`}>View Full Case →</a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Legal Issues Identified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.analysis.legalIssues.map((issue, index) => (
                    <Badge key={index} variant="secondary">
                      {issue}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
