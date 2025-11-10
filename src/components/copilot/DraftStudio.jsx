import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Sparkles, Copy, Download, RefreshCw, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

export default function DraftStudio() {
  const [conversationId, setConversationId] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("prompt-to-draft");
  const [drafts, setDrafts] = useState([]);
  const [generating, setGenerating] = useState(false);

  // Initialize conversation with Draft Agent
  useEffect(() => {
    const initConversation = async () => {
      try {
        const conversation = await base44.agents.createConversation({
          agent_name: "copilot_draft",
          metadata: {
            name: "Draft Generation Session",
            description: "AI-powered content generation",
            mode: mode
          }
        });
        setConversationId(conversation.id);
      } catch (error) {
        console.error("Failed to initialize draft conversation:", error);
        toast.error("Failed to connect to Draft Agent");
      }
    };

    initConversation();
  }, []);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      if (data.messages && data.messages.length > 0) {
        const lastMessage = data.messages[data.messages.length - 1];
        if (lastMessage.role === "assistant" && lastMessage.content) {
          // Parse AI response and extract drafts
          processDraftResponse(lastMessage.content);
          setGenerating(false);
        }
      }
    });

    return () => unsubscribe();
  }, [conversationId, mode]);

  const processDraftResponse = (content) => {
    if (mode === "streamed") {
      // For streamed mode, try to parse multiple variants
      // The AI should format them with clear markers
      const variants = parseVariants(content);
      if (variants.length > 0) {
        setDrafts(variants);
      } else {
        // Fallback: create single draft
        setDrafts([{
          id: Date.now(),
          variant: "Generated",
          content: content
        }]);
      }
    } else {
      // Single draft mode
      setDrafts([{
        id: Date.now(),
        variant: mode === "collaborative" ? "Review" : "Generated",
        content: content
      }]);
    }
  };

  const parseVariants = (content) => {
    // Try to parse variants from AI response
    // Expected format: "### BALANCED\n...\n### DETAILED\n...\n### AGGRESSIVE\n..."
    const variants = [];
    const sections = content.split(/###\s+(BALANCED|DETAILED|AGGRESSIVE)/gi);
    
    if (sections.length > 1) {
      for (let i = 1; i < sections.length; i += 2) {
        if (sections[i] && sections[i + 1]) {
          variants.push({
            id: Date.now() + i,
            variant: sections[i].trim(),
            content: sections[i + 1].trim()
          });
        }
      }
    }
    
    return variants;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!conversationId) {
      toast.error("Draft agent not connected");
      return;
    }

    setGenerating(true);
    setDrafts([]);

    try {
      // Get current conversation
      const conversation = await base44.agents.getConversation(conversationId);
      
      // Build prompt based on mode
      let fullPrompt = prompt;
      
      if (mode === "streamed") {
        fullPrompt = `Generate 3 variants of the following content:\n\n${prompt}\n\nProvide:\n1. ### BALANCED - Professional, concise version\n2. ### DETAILED - Comprehensive, thorough version\n3. ### AGGRESSIVE - Direct, urgent version\n\nFormat each section with the ### heading followed by the content.`;
      } else if (mode === "collaborative") {
        fullPrompt = `Review and improve the following draft:\n\n${prompt}\n\nProvide:\n1. Improved version\n2. List of specific changes made\n3. Suggestions for further improvement`;
      }
      
      // Send to Draft Agent
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: fullPrompt
      });

      toast.success("Generating draft...");
    } catch (error) {
      console.error("Failed to generate draft:", error);
      toast.error("Failed to generate draft");
      setGenerating(false);
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard");
  };

  const handleDownload = (content, variant) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `draft_${variant}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Draft downloaded");
  };

  const handleRegenerate = () => {
    if (prompt.trim()) {
      handleGenerate();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Draft Studio</h2>
                <p className="text-sm text-slate-600">Powered by Co-Pilot Draft Agent - Generate operational content</p>
              </div>
            </div>
            {conversationId && (
              <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>

          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === "prompt-to-draft" ? "default" : "outline"}
              onClick={() => {
                setMode("prompt-to-draft");
                setDrafts([]);
              }}
              className={mode === "prompt-to-draft" ? "bg-purple-600" : ""}
            >
              Prompt-to-Draft
            </Button>
            <Button
              size="sm"
              variant={mode === "streamed" ? "default" : "outline"}
              onClick={() => {
                setMode("streamed");
                setDrafts([]);
              }}
              className={mode === "streamed" ? "bg-purple-600" : ""}
            >
              Streamed Variants
            </Button>
            <Button
              size="sm"
              variant={mode === "collaborative" ? "default" : "outline"}
              onClick={() => {
                setMode("collaborative");
                setDrafts([]);
              }}
              className={mode === "collaborative" ? "bg-purple-600" : ""}
            >
              Collaborative Edits
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mode Description */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-sm text-slate-700">
            {mode === "prompt-to-draft" && "📝 Turn plain English into structured operational text or workflow config"}
            {mode === "streamed" && "🔀 View multiple drafts in parallel (\"Balanced\", \"Detailed\", \"Aggressive\")"}
            {mode === "collaborative" && "✏️ Paste your draft for AI review, suggestions, and improvements"}
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-6">
          <label className="text-sm font-bold text-slate-900 mb-2 block">
            {mode === "collaborative" ? "Paste your draft for AI feedback" : "Describe what you need"}
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === "prompt-to-draft" 
                ? "Example: Write a professional response for invoice delay..." 
                : mode === "streamed"
                ? "Example: Create reply template for customer refund request..."
                : "Paste your draft text here for AI suggestions..."
            }
            className="min-h-32 mb-4"
            disabled={generating || !conversationId}
          />
          <Button
            onClick={handleGenerate}
            disabled={generating || !conversationId || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {generating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {mode === "streamed" ? "Generate Variants" : mode === "collaborative" ? "Get AI Feedback" : "Generate Draft"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Drafts */}
      <AnimatePresence>
        {drafts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-4"
          >
            {drafts.map((draft, idx) => (
              <Card key={draft.id} className="bg-white border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-purple-100 text-purple-700">
                      {draft.variant}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(draft.content)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(draft.content, draft.variant)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                      {mode === "streamed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRegenerate}
                          disabled={generating}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Regenerate
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{draft.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Types */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <h4 className="text-sm font-bold text-slate-900 mb-3">What You Can Generate</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-700">
            {[
              "Reply templates for internal approvals",
              "Policy documents",
              "Root-cause analyses (RCAs)",
              "Forecast commentary, board reports",
              "AI configuration drafts (YAML/JSON)",
              "Email templates",
              "Meeting summaries",
              "Project proposals",
              "Technical documentation"
            ].map((type, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
                <span>{type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Example Templates */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-4">
          <h4 className="text-sm font-bold text-slate-900 mb-3">Quick Start Templates</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Invoice Delay Response", prompt: "Write a professional response for invoice delay" },
              { name: "RCA - Service Outage", prompt: "Create a root cause analysis for AWS service outage that lasted 2 hours" },
              { name: "Meeting Summary", prompt: "Generate a meeting summary template with action items" },
              { name: "Policy Document", prompt: "Draft a remote work policy document" }
            ].map((template, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="flex flex-col items-start h-auto py-3 text-left"
                onClick={() => {
                  setPrompt(template.prompt);
                  toast.info(`Template loaded: ${template.name}`);
                }}
              >
                <span className="text-sm font-semibold text-slate-900">{template.name}</span>
                <span className="text-xs text-slate-600 mt-1">{template.prompt}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}