import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Search,
  FileText,
  Database,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Landing() {
  const { user, loading, login } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      window.location.href = "/dashboard";
    } else {
      login();
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Scale className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold">BetterCall AI</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!loading && (
              user ? (
                <Link href="/dashboard">
                  <Button data-testid="button-dashboard">Dashboard</Button>
                </Link>
              ) : (
                <Button onClick={login} data-testid="button-signin">
                  Sign In
                </Button>
              )
            )}
          </div>
        </div>
      </header>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6" variant="secondary">
              AI-Powered Legal Research
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Revolutionary Legal Research
              <span className="block text-primary mt-2">Powered by AI</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Search through 130,000+ legal documents with AI understanding.
              Analyze judgments, find precedents, and research cases faster than ever before.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="gap-2"
                data-testid="button-get-started"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover-elevate">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>130K+ Documents</CardTitle>
                <CardDescription>
                  Comprehensive legal database from India Kanoon
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered</CardTitle>
                <CardDescription>
                  Advanced semantic search and judgment analysis
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure & Fast</CardTitle>
                <CardDescription>
                  Secure authentication with instant results
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">
              Features
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need for Legal Research
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for legal professionals
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-4">
                  <Search className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">Semantic Case Search</CardTitle>
                <CardDescription>
                  Search through 130,000+ legal documents with AI-powered semantic understanding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Advanced filtering by court, jurisdiction, and date</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Real-time search with intelligent caching</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Multi-strategy fallback for reliable results</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">AI Judgment Analysis</CardTitle>
                <CardDescription>
                  Upload legal documents and get instant AI-powered analysis with precedent matching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Extract key points and legal issues automatically</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Find relevant precedents and citations</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Get actionable recommendations</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-4">
                  <Database className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">Vector Database Search</CardTitle>
                <CardDescription>
                  Search through 45+ scraped Indian laws with semantic vector embeddings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Intelligent semantic matching</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Relevance scoring for accurate results</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Fast retrieval with Pinecone integration</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-4">
                  <Scale className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">Case Details & Citations</CardTitle>
                <CardDescription>
                  Comprehensive case information with full text, citations, and related cases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Complete case details and metadata</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Citation tracking and precedent links</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Save searches and bookmark cases</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Legal Research?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join legal professionals who are already using AI to work smarter
          </p>
          <Button size="lg" onClick={handleGetStarted} className="gap-2" data-testid="button-cta">
            Get Started Now <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <footer className="border-t py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                  <Scale className="h-6 w-6" />
                </div>
                <span className="text-lg font-semibold">BetterCall AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered legal research platform for modern legal professionals
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Legal Database</li>
                <li>API Reference</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} BetterCall AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
