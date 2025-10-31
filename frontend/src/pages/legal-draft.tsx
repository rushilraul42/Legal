import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Loader2, AlertCircle, CheckCircle, Sparkles, FileDown, Clock, Copy, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBackgroundTasks, DraftTask } from "@/contexts/BackgroundTasksContext";

// Example draft templates
const EXAMPLE_TEMPLATES = [
  {
    name: "Residential Rental Agreement",
    draftType: "agreement",
    prompt: "Create a residential rental agreement for a property in Mumbai. Landlord: Mr. Rajesh Sharma, Tenant: Ms. Priya Patel. Property: 2BHK Flat at Andheri West. Monthly rent: Rs. 25,000. Security deposit: Rs. 50,000. Lease period: 11 months starting from 1st January 2024. Include standard clauses for maintenance, utilities, and termination.",
    parties: "Mr. Rajesh Sharma (Landlord), Ms. Priya Patel (Tenant)",
    court: "Mumbai",
    specificClauses: "Maintenance responsibilities\nUtility payment terms\nTermination conditions\nNotice period of 2 months",
    tone: "formal" as const,
  },
  {
    name: "Legal Notice - Cheque Bouncing",
    draftType: "notice",
    prompt: "Draft a legal notice under Section 138 of the Negotiable Instruments Act for a dishonored cheque. Payee: ABC Enterprises Ltd., Drawer: XYZ Trading Co. Cheque No: 123456, Amount: Rs. 5,00,000, Bank: HDFC Bank, Reason for dishonor: Insufficient funds. Date of dishonor: 15th October 2023. Demand payment within 15 days.",
    parties: "ABC Enterprises Ltd. (Payee), XYZ Trading Co. (Drawer)",
    court: "Delhi District Court",
    specificClauses: "Section 138 NI Act reference\nDemand for payment\n15 days notice period\nLegal consequences warning",
    tone: "formal" as const,
  },
  {
    name: "Divorce Petition",
    draftType: "petition",
    prompt: "Prepare a divorce petition under Section 13 of the Hindu Marriage Act, 1955 on grounds of cruelty and desertion. Petitioner: Mrs. Anjali Mehta, Respondent: Mr. Vikram Mehta. Marriage date: 5th June 2015. Separation since: March 2022. Include details of mental cruelty, lack of maintenance, and 2-year desertion. One minor child custody sought by petitioner.",
    parties: "Mrs. Anjali Mehta (Petitioner), Mr. Vikram Mehta (Respondent)",
    court: "Family Court, Bangalore",
    specificClauses: "Grounds of cruelty\nDesertion for 2+ years\nChild custody claim\nMaintenance demand\nProperty settlement",
    tone: "formal" as const,
  },
  {
    name: "Bail Application",
    draftType: "application",
    prompt: "Draft a bail application under Section 439 CrPC for a person accused under Section 323 IPC (causing hurt). Applicant: Mr. Suresh Kumar, Case: FIR No. 234/2023, Police Station: Koramangala. Accused is first-time offender, sole breadwinner of family, willing to cooperate with investigation. No criminal antecedents. Ready to furnish bail bond and surety.",
    parties: "Mr. Suresh Kumar (Applicant), State of Karnataka (Respondent)",
    court: "Sessions Court, Bangalore",
    specificClauses: "No criminal record\nWillingness to cooperate\nFamily dependency\nBail bond surety offer\nNo flight risk",
    tone: "persuasive" as const,
  },
  {
    name: "Consumer Complaint - Defective Product",
    draftType: "petition",
    prompt: "File a consumer complaint for a defective refrigerator. Complainant: Mr. Ramesh Gupta, Opposite Party: ElectroMart Pvt Ltd. Product: Samsung Refrigerator Model RF-500, Purchase date: 10th August 2023, Price: Rs. 45,000. Product stopped working within 3 months, company refusing replacement despite warranty. Seeking replacement or refund with compensation for mental harassment.",
    parties: "Mr. Ramesh Gupta (Complainant), ElectroMart Pvt Ltd (Opposite Party)",
    court: "District Consumer Forum, Pune",
    specificClauses: "Defect within warranty period\nRefusal to honor warranty\nDemand for replacement or refund\nCompensation for harassment\nLegal costs",
    tone: "persuasive" as const,
  },
];

interface DraftGenerationRequest {
  prompt: string;
  draftType?: string;
  additionalContext?: {
    parties?: string[];
    court?: string;
    specificClauses?: string[];
    tone?: "formal" | "persuasive" | "neutral";
  };
}

interface DraftGenerationResponse {
  id: string;
  draft: string;
  metadata: {
    generatedAt: string;
    model: string;
    tokensUsed?: number;
    processingTime: string;
  };
  references: Array<{
    filename: string;
    relevanceScore: number;
    sections?: string[];
  }>;
  suggestions?: string[];
}

export default function LegalDraft() {
  const { toast } = useToast();
  const { tasks, addTask, updateTask, getTask } = useBackgroundTasks();
  const [prompt, setPrompt] = useState("");
  const [draftType, setDraftType] = useState<string>("");
  const [parties, setParties] = useState("");
  const [court, setCourt] = useState("");
  const [specificClauses, setSpecificClauses] = useState("");
  const [tone, setTone] = useState<"formal" | "persuasive" | "neutral">("formal");
  const [generatedDraft, setGeneratedDraft] = useState<DraftGenerationResponse | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDraft, setEditedDraft] = useState("");

  // Check for completed tasks on mount and when tasks update
  useEffect(() => {
    if (currentTaskId) {
      const task = getTask(currentTaskId);
      if (task && task.status === 'completed' && task.result) {
        setGeneratedDraft(task.result);
        setEditedDraft(task.result.draft);
        setCurrentTaskId(null);
      }
    } else {
      // Check if there's a recently completed draft task
      const completedDraftTask = tasks
        .filter((t): t is DraftTask => t.type === 'draft' && t.status === 'completed' && !!t.result)
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
      
      if (completedDraftTask && !generatedDraft) {
        setGeneratedDraft(completedDraftTask.result);
        setEditedDraft(completedDraftTask.result.draft);
      }
    }
  }, [tasks, currentTaskId, getTask, generatedDraft]);

  const loadTemplate = (template: typeof EXAMPLE_TEMPLATES[0]) => {
    setPrompt(template.prompt);
    setDraftType(template.draftType);
    setParties(template.parties);
    setCourt(template.court);
    setSpecificClauses(template.specificClauses);
    setTone(template.tone);
    toast({
      title: "Template Loaded",
      description: `"${template.name}" template has been loaded. You can modify and generate.`,
    });
  };

  const handleEditDraft = () => {
    if (generatedDraft) {
      setEditedDraft(generatedDraft.draft);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (generatedDraft) {
      setGeneratedDraft({
        ...generatedDraft,
        draft: editedDraft,
      });
      setIsEditing(false);
      toast({
        title: "Changes Saved",
        description: "Your edits have been saved to the draft.",
      });
    }
  };

  const handleCancelEdit = () => {
    if (generatedDraft) {
      setEditedDraft(generatedDraft.draft);
    }
    setIsEditing(false);
  };

  const generateDraftMutation = useMutation({
    mutationFn: async (request: DraftGenerationRequest & { taskId: string }) => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      
      // Update task to processing
      updateTask(request.taskId, { status: 'processing' });
      
      const response = await fetch(`${apiBaseUrl}/api/drafts/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate draft");
      }

      return { data: await response.json(), taskId: request.taskId };
    },
    onSuccess: ({ data, taskId }: { data: DraftGenerationResponse; taskId: string }) => {
      setGeneratedDraft(data);
      setEditedDraft(data.draft);
      updateTask(taskId, {
        status: 'completed',
        result: data,
      });
      toast({
        title: "Draft Generated Successfully",
        description: `Generated in ${data.metadata.processingTime}`,
      });
    },
    onError: (error: Error, variables) => {
      updateTask(variables.taskId, {
        status: 'error',
        error: error.message,
      });
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt || prompt.length < 10) {
      toast({
        title: "Invalid Prompt",
        description: "Please provide a detailed description (at least 10 characters)",
        variant: "destructive",
      });
      return;
    }

    const request: DraftGenerationRequest = {
      prompt,
      draftType: draftType || undefined,
      additionalContext: {
        parties: parties ? parties.split(",").map(p => p.trim()) : undefined,
        court: court || undefined,
        specificClauses: specificClauses ? specificClauses.split("\n").filter(c => c.trim()) : undefined,
        tone,
      },
    };

    // Create background task
    const taskId = addTask({
      type: 'draft',
      prompt: prompt,
      draftType: draftType || undefined,
    });
    
    setCurrentTaskId(taskId);
    
    // Start generation with task ID
    generateDraftMutation.mutate({ ...request, taskId });
  };

  const downloadAsWord = () => {
    if (!generatedDraft) return;

    // Use edited draft if available, otherwise use original
    const draftContent = isEditing ? editedDraft : (editedDraft || generatedDraft.draft);

    // Create a simple HTML document that Word can open
    // Only include the draft content, no metadata
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Legal Draft - ${generatedDraft.id}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            margin: 2.5cm;
            font-size: 12pt;
          }
          h1 {
            text-align: center;
            text-decoration: underline;
            margin-bottom: 2em;
          }
          p {
            text-align: justify;
            margin-bottom: 1em;
          }
        </style>
      </head>
      <body>
        ${draftContent.split('\n').map(line => {
          if (line.trim().startsWith('#')) {
            return `<h1>${line.replace(/^#+\s*/, '')}</h1>`;
          } else if (line.trim()) {
            return `<p>${line}</p>`;
          } else {
            return '<br/>';
          }
        }).join('\n')}
      </body>
      </html>
    `;

    // Create blob with proper MIME type for Word
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `legal-draft-${generatedDraft.id}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Draft saved as Word document",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Legal Draft Generator</h1>
          <p className="text-muted-foreground">
            Generate accurate legal drafts using AI with your template library
          </p>
        </div>
      </div>

      {/* Example Templates Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Copy className="h-5 w-5" />
            Quick Start Templates
          </CardTitle>
          <CardDescription>
            Click on any template to prefill the form and get started quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {EXAMPLE_TEMPLATES.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-3 px-4 flex flex-col items-start gap-1 hover:bg-primary/5 w-full overflow-hidden"
                onClick={() => loadTemplate(template)}
              >
                <div className="font-semibold text-sm w-full truncate text-left">
                  {template.name}
                </div>
                <div className="text-xs text-muted-foreground text-left line-clamp-2 w-full overflow-hidden">
                  {template.prompt.substring(0, 100)}...
                </div>
                <Badge variant="secondary" className="text-xs mt-1">
                  {template.draftType}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Draft Details
              </CardTitle>
              <CardDescription>
                Provide detailed requirements for your legal draft
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Draft Description *</Label>
                <Textarea
                  id="prompt"
                  placeholder="Example: Create a residential rental agreement for a property in Mumbai. Landlord: Mr. Sharma, Tenant: Ms. Patel. Monthly rent: Rs. 25,000. Security deposit: Rs. 50,000. Lease period: 11 months."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Minimum 10 characters. Be as detailed as possible.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="draftType">Draft Type</Label>
                <Select value={draftType} onValueChange={setDraftType}>
                  <SelectTrigger id="draftType">
                    <SelectValue placeholder="Select draft type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agreement">Agreement</SelectItem>
                    <SelectItem value="notice">Legal Notice</SelectItem>
                    <SelectItem value="petition">Petition</SelectItem>
                    <SelectItem value="affidavit">Affidavit</SelectItem>
                    <SelectItem value="application">Application</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parties">Parties (comma-separated)</Label>
                <Input
                  id="parties"
                  placeholder="Mr. Sharma, Ms. Patel"
                  value={parties}
                  onChange={(e) => setParties(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="court">Court/Jurisdiction</Label>
                <Input
                  id="court"
                  placeholder="Mumbai District Court"
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clauses">Specific Clauses (one per line)</Label>
                <Textarea
                  id="clauses"
                  placeholder="Maintenance responsibilities&#10;Termination conditions&#10;Notice period"
                  value={specificClauses}
                  onChange={(e) => setSpecificClauses(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateDraftMutation.isPending}
                className="w-full"
                size="lg"
              >
                {generateDraftMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Draft...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Draft
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {!generatedDraft && !generateDraftMutation.isPending && (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Draft Generated</h3>
                <p className="text-muted-foreground">
                  Fill in the details and click "Generate Draft" to create your legal document
                </p>
              </CardContent>
            </Card>
          )}

          {generateDraftMutation.isPending && (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-lg font-medium">Generating your draft...</p>
                  <p className="text-sm text-muted-foreground">
                    This may take 5-10 seconds
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {generatedDraft && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Generated Draft
                  </CardTitle>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <>
                        <Button onClick={handleEditDraft} variant="outline" size="sm">
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Draft
                        </Button>
                        <Button onClick={downloadAsWord} variant="outline" size="sm">
                          <FileDown className="mr-2 h-4 w-4" />
                          Download Word
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={handleSaveEdit} variant="default" size="sm">
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" size="sm">
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <CardDescription>
                  Generated in {generatedDraft.metadata.processingTime}
                  {isEditing && <span className="ml-2 text-orange-500">• Editing mode</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="draft" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="draft">Draft</TabsTrigger>
                    <TabsTrigger value="references">References</TabsTrigger>
                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="draft" className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor="editDraft">Edit your draft</Label>
                        <Textarea
                          id="editDraft"
                          value={editedDraft}
                          onChange={(e) => setEditedDraft(e.target.value)}
                          rows={25}
                          className="font-serif text-sm leading-relaxed resize-none"
                        />
                        <p className="text-sm text-muted-foreground">
                          Make your changes above. Click "Save Changes" when done.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-muted rounded-lg p-4 max-h-[600px] overflow-auto">
                        <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                          {editedDraft || generatedDraft.draft}
                        </pre>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="references" className="space-y-4">
                    {generatedDraft.references.length > 0 ? (
                      <div className="space-y-3">
                        {generatedDraft.references.map((ref, idx) => (
                          <Alert key={idx}>
                            <FileText className="h-4 w-4" />
                            <AlertDescription>
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{ref.filename}</p>
                                  {ref.sections && ref.sections.length > 0 && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {ref.sections[0]}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="secondary">
                                  {(ref.relevanceScore * 100).toFixed(1)}% match
                                </Badge>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No reference documents found. Add PDF templates to improve accuracy.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="suggestions" className="space-y-4">
                    {generatedDraft.suggestions && generatedDraft.suggestions.length > 0 ? (
                      <div className="space-y-3">
                        {generatedDraft.suggestions.map((suggestion, idx) => (
                          <Alert key={idx}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <p className="font-medium">Suggestion {idx + 1}</p>
                              <p className="text-sm mt-1">{suggestion}</p>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          No specific suggestions. The draft looks good!
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
