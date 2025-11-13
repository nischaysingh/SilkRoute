
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { User, Plus, Edit, Trash2, Eye, Sparkles, Check, Brain, MessageSquare, Loader2, Activity, TrendingUp, Star, Award, Target, Clock, Zap, GraduationCap, Users, TestTube } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PersonaTrainingModule from "./PersonaTrainingModule";
import MultiAgentCollaboration from "./MultiAgentCollaboration";
import AutomatedTestingSuite from "../testing/AutomatedTestingSuite";

const PERSONALITY_TRAITS = [
  "Analytical", "Creative", "Detail-oriented", "Strategic", "Empathetic",
  "Decisive", "Collaborative", "Proactive", "Methodical", "Innovative"
];

const KNOWLEDGE_DOMAINS = [
  "Finance", "Operations", "Engineering", "Sales", "Marketing",
  "Customer Service", "Data Analysis", "Compliance", "HR", "Legal"
];

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function PersonaBuilder() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [trainingModuleOpen, setTrainingModuleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personas");
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [traits, setTraits] = useState([]);
  const [domains, setDomains] = useState([]);
  const [tasks, setTasks] = useState("");
  const [tone, setTone] = useState("friendly");
  const [verbosity, setVerbosity] = useState("moderate");
  const [emojiUsage, setEmojiUsage] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState("");

  const queryClient = useQueryClient();

  const { data: personas = [], isLoading } = useQuery({
    queryKey: ['ai-personas'],
    queryFn: () => base44.entities.AIAgentPersona.list('-created_date', 50)
  });

  const createPersonaMutation = useMutation({
    mutationFn: (personaData) => base44.entities.AIAgentPersona.create(personaData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-personas'] });
      toast.success("Persona created successfully");
      resetForm();
      setCreateDialogOpen(false);
    }
  });

  const updatePersonaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AIAgentPersona.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-personas'] });
      toast.success("Persona updated");
    }
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setTraits([]);
    setDomains([]);
    setTasks("");
    setTone("friendly");
    setVerbosity("moderate");
    setEmojiUsage(true);
    setSystemPrompt("");
  };

  const handleCreate = () => {
    if (!name || !description) {
      toast.error("Name and description are required");
      return;
    }

    const personaData = {
      name,
      description,
      personality_traits: traits,
      communication_style: {
        tone,
        verbosity,
        emoji_usage: emojiUsage
      },
      knowledge_domains: domains,
      specialized_tasks: tasks ? tasks.split('\n').filter(t => t.trim()) : [],
      system_prompt: systemPrompt || `You are ${name}, an AI assistant specialized in ${domains.join(', ')}. ${description}`,
      status: "testing",
      assigned_missions: [],
      performance_metrics: {
        avg_user_satisfaction: 0,
        task_success_rate: 0,
        avg_response_quality: 0
      }
    };

    createPersonaMutation.mutate(personaData);
  };

  const handleActivate = async (persona) => {
    await updatePersonaMutation.mutateAsync({
      id: persona.id,
      data: { status: 'active' }
    });
  };

  const toggleTrait = (trait) => {
    setTraits(prev =>
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    );
  };

  const toggleDomain = (domain) => {
    setDomains(prev =>
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  // Dashboard calculations
  const activePersonas = personas.filter(p => p.status === 'active').length;
  const testingPersonas = personas.filter(p => p.status === 'testing').length;
  const avgSatisfaction = personas.length > 0 
    ? (personas.reduce((sum, p) => sum + (p.performance_metrics?.avg_user_satisfaction || 0), 0) / personas.length * 100)
    : 0;
  const avgSuccessRate = personas.length > 0
    ? (personas.reduce((sum, p) => sum + (p.performance_metrics?.task_success_rate || 0), 0) / personas.length * 100)
    : 0;

  // Domain distribution
  const domainDistribution = {};
  personas.forEach(p => {
    p.knowledge_domains?.forEach(domain => {
      domainDistribution[domain] = (domainDistribution[domain] || 0) + 1;
    });
  });
  const domainChartData = Object.entries(domainDistribution).map(([name, value]) => ({ name, value }));

  // Top performers
  const topPerformers = [...personas]
    .sort((a, b) => (b.performance_metrics?.avg_user_satisfaction || 0) - (a.performance_metrics?.avg_user_satisfaction || 0))
    .slice(0, 5);

  // Mock conversation history for selected persona
  const mockConversations = [
    { id: 1, timestamp: "2 hours ago", user_query: "Analyze Q4 financials", response_quality: 0.96, duration_ms: 1240 },
    { id: 2, timestamp: "5 hours ago", user_query: "Create budget forecast", response_quality: 0.94, duration_ms: 2100 },
    { id: 3, timestamp: "1 day ago", user_query: "Review expense report", response_quality: 0.92, duration_ms: 890 },
    { id: 4, timestamp: "2 days ago", user_query: "Cash flow analysis", response_quality: 0.98, duration_ms: 1580 },
    { id: 5, timestamp: "3 days ago", user_query: "Variance report", response_quality: 0.91, duration_ms: 1120 }
  ];

  // Performance trend data
  const performanceTrend = [
    { date: "Week 1", satisfaction: 0.89, success: 0.91, quality: 0.88 },
    { date: "Week 2", satisfaction: 0.91, success: 0.93, quality: 0.90 },
    { date: "Week 3", satisfaction: 0.93, success: 0.94, quality: 0.92 },
    { date: "Week 4", satisfaction: 0.94, success: 0.96, quality: 0.93 }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="personas" className="data-[state=active]:bg-blue-50">
            <User className="w-4 h-4 mr-2" />
            Personas
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-purple-50">
            <GraduationCap className="w-4 h-4 mr-2" />
            Training
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="data-[state=active]:bg-emerald-50">
            <Users className="w-4 h-4 mr-2" />
            Multi-Agent
          </TabsTrigger>
          <TabsTrigger value="testing" className="data-[state=active]:bg-amber-50">
            <TestTube className="w-4 h-4 mr-2" />
            Testing
          </TabsTrigger>
        </TabsList>

        {/* Personas Tab */}
        <TabsContent value="personas" className="space-y-4 mt-6">
          {/* Dashboard Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                AI Personas Dashboard
              </h3>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Persona
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <Badge className="bg-blue-100 text-blue-700 text-xs">Total</Badge>
                  </div>
                  <div className="text-3xl font-bold text-blue-900 mb-1">{personas.length}</div>
                  <div className="text-xs text-blue-700">AI Personas</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">Active</Badge>
                  </div>
                  <div className="text-3xl font-bold text-emerald-900 mb-1">{activePersonas}</div>
                  <div className="text-xs text-emerald-700">Deployed</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    <Badge className="bg-purple-100 text-purple-700 text-xs">Avg</Badge>
                  </div>
                  <div className="text-3xl font-bold text-purple-900 mb-1">{avgSatisfaction.toFixed(0)}%</div>
                  <div className="text-xs text-purple-700">Satisfaction</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-5 h-5 text-amber-600" />
                    <Badge className="bg-amber-100 text-amber-700 text-xs">Avg</Badge>
                  </div>
                  <div className="text-3xl font-bold text-amber-900 mb-1">{avgSuccessRate.toFixed(0)}%</div>
                  <div className="text-xs text-amber-700">Success Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Domain Distribution */}
              <Card className="bg-white border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-900">Knowledge Domain Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={domainChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {domainChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="bg-white border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    Top Performing Personas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topPerformers.map((persona, idx) => (
                      <div key={persona.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                            idx === 0 ? "bg-yellow-500" :
                            idx === 1 ? "bg-slate-400" :
                            idx === 2 ? "bg-amber-600" :
                            "bg-blue-600"
                          )}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{persona.name}</div>
                            <div className="text-xs text-slate-600">
                              {persona.knowledge_domains?.slice(0, 2).join(", ")}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-amber-900">
                            {((persona.performance_metrics?.avg_user_satisfaction || 0) * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-slate-600">satisfaction</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Personas Grid */}
          <div>
            <h4 className="text-base font-bold text-slate-900 mb-4">All AI Personas ({personas.length})</h4>
            
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-sm text-slate-600">Loading personas...</p>
              </div>
            ) : personas.length === 0 ? (
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-12 text-center">
                  <User className="w-16 h-16 mx-auto mb-4 text-blue-400 opacity-50" />
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">No personas yet</h4>
                  <p className="text-sm text-slate-600 mb-4">Create custom AI personas for specialized tasks</p>
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create First Persona
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {personas.map((persona, idx) => (
                    <motion.div
                      key={persona.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Card className={cn(
                        "border-2 hover:shadow-lg transition-all cursor-pointer",
                        persona.status === "active" ? "border-emerald-300 bg-emerald-50" :
                        persona.status === "testing" ? "border-blue-300 bg-blue-50" :
                        "border-slate-300 bg-slate-50 opacity-70"
                      )}
                      onClick={() => {
                        setSelectedPersona(persona);
                        setDetailDialogOpen(true);
                      }}>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                {persona.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-slate-900">{persona.name}</h4>
                                <Badge className={cn(
                                  "text-xs mt-1",
                                  persona.status === "active" ? "bg-emerald-100 text-emerald-700" :
                                  persona.status === "testing" ? "bg-blue-100 text-blue-700" :
                                  "bg-slate-100 text-slate-700"
                                )}>
                                  {persona.status}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{persona.description}</p>

                          {/* Performance Metrics */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="text-center p-2 bg-white rounded border border-slate-200">
                              <div className="text-lg font-bold text-emerald-600">
                                {((persona.performance_metrics?.avg_user_satisfaction || 0) * 100).toFixed(0)}%
                              </div>
                              <div className="text-xs text-slate-600">Satisfaction</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded border border-slate-200">
                              <div className="text-lg font-bold text-blue-600">
                                {((persona.performance_metrics?.task_success_rate || 0) * 100).toFixed(0)}%
                              </div>
                              <div className="text-xs text-slate-600">Success</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded border border-slate-200">
                              <div className="text-lg font-bold text-purple-600">
                                {((persona.performance_metrics?.avg_response_quality || 0) * 100).toFixed(0)}%
                              </div>
                              <div className="text-xs text-slate-600">Quality</div>
                            </div>
                          </div>

                          {/* Traits */}
                          {persona.personality_traits?.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs text-slate-600 mb-1">Traits</div>
                              <div className="flex flex-wrap gap-1">
                                {persona.personality_traits.slice(0, 3).map((trait, tidx) => (
                                  <Badge key={tidx} className="bg-purple-100 text-purple-700 text-xs">
                                    {trait}
                                  </Badge>
                                ))}
                                {persona.personality_traits.length > 3 && (
                                  <Badge className="bg-slate-100 text-slate-700 text-xs">
                                    +{persona.personality_traits.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Knowledge Domains */}
                          {persona.knowledge_domains?.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs text-slate-600 mb-1">Domains</div>
                              <div className="flex flex-wrap gap-1">
                                {persona.knowledge_domains.slice(0, 2).map((domain, didx) => (
                                  <Badge key={didx} className="bg-blue-100 text-blue-700 text-xs">
                                    {domain}
                                  </Badge>
                                ))}
                                {persona.knowledge_domains.length > 2 && (
                                  <Badge className="bg-slate-100 text-slate-700 text-xs">
                                    +{persona.knowledge_domains.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Communication Style */}
                          <div className="p-2 bg-white rounded border border-slate-200 mb-3">
                            <div className="flex items-center gap-2 text-xs">
                              <MessageSquare className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-900 font-semibold">{persona.communication_style?.tone}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-900">{persona.communication_style?.verbosity}</span>
                            </div>
                          </div>

                          {/* Train Button */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent opening detail dialog
                              setSelectedPersona(persona);
                              setTrainingModuleOpen(true);
                            }}
                            variant="outline"
                            className="w-full h-8 text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <GraduationCap className="w-3 h-3 mr-1" />
                            Train This Persona
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="mt-6">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-12 text-center">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Persona Training Module</h4>
              <p className="text-sm text-slate-600 mb-4">
                Select a persona from the Personas tab and click "Train This Persona" to begin fine-tuning.
              </p>
              <Button
                onClick={() => setActiveTab("personas")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <User className="w-4 h-4 mr-2" />
                Browse Personas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Agent Collaboration Tab */}
        <TabsContent value="collaboration" className="mt-6">
          <MultiAgentCollaboration />
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="mt-6">
          <AutomatedTestingSuite />
        </TabsContent>
      </Tabs>

      {/* Training Module Dialog */}
      {trainingModuleOpen && selectedPersona && (
        <PersonaTrainingModule
          persona={selectedPersona}
          onClose={() => {
            setTrainingModuleOpen(false);
            queryClient.invalidateQueries({ queryKey: ['ai-personas'] });
          }}
        />
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Create AI Persona
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Define a custom AI agent with specific traits and capabilities
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Persona Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Financial Analyst Bot"
                className="bg-white border-slate-200"
              />
            </div>

            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this persona do?"
                className="bg-white border-slate-200 min-h-20"
              />
            </div>

            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Personality Traits</Label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_TRAITS.map((trait) => (
                  <Badge
                    key={trait}
                    onClick={() => toggleTrait(trait)}
                    className={cn(
                      "cursor-pointer text-xs",
                      traits.includes(trait)
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {traits.includes(trait) && <Check className="w-3 h-3 mr-1" />}
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Knowledge Domains</Label>
              <div className="flex flex-wrap gap-2">
                {KNOWLEDGE_DOMAINS.map((domain) => (
                  <Badge
                    key={domain}
                    onClick={() => toggleDomain(domain)}
                    className={cn(
                      "cursor-pointer text-xs",
                      domains.includes(domain)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {domains.includes(domain) && <Check className="w-3 h-3 mr-1" />}
                    {domain}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Specialized Tasks (one per line)</Label>
              <Textarea
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                placeholder="Invoice reconciliation&#10;Payment processing&#10;Financial reporting"
                className="bg-white border-slate-200 min-h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-900 text-sm mb-2 block">Communication Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-900 text-sm mb-2 block">Verbosity</Label>
                <Select value={verbosity} onValueChange={setVerbosity}>
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="brief">Brief</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <Label className="text-slate-900 text-sm cursor-pointer">Use Emojis</Label>
              <Switch checked={emojiUsage} onCheckedChange={setEmojiUsage} />
            </div>

            <div>
              <Label className="text-slate-900 text-sm mb-2 block">Custom System Prompt (Optional)</Label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Advanced: Override default system prompt..."
                className="bg-white border-slate-200 min-h-20 font-mono text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name || !description || createPersonaMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {createPersonaMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Create Persona
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {selectedPersona?.name.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-slate-900 text-xl">{selectedPersona?.name}</DialogTitle>
                <p className="text-sm text-slate-600">{selectedPersona?.description}</p>
              </div>
            </div>
          </DialogHeader>

          {selectedPersona && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4 text-center">
                      <Star className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                      <div className="text-2xl font-bold text-emerald-900">
                        {((selectedPersona.performance_metrics?.avg_user_satisfaction || 0) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-emerald-700">User Satisfaction</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <Target className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-900">
                        {((selectedPersona.performance_metrics?.task_success_rate || 0) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-blue-700">Task Success Rate</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <Award className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-900">
                        {((selectedPersona.performance_metrics?.avg_response_quality || 0) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-purple-700">Response Quality</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-600 mb-2 block">Personality Traits</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPersona.personality_traits?.map((trait, idx) => (
                        <Badge key={idx} className="bg-purple-100 text-purple-700 text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-600 mb-2 block">Knowledge Domains</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPersona.knowledge_domains?.map((domain, idx) => (
                        <Badge key={idx} className="bg-blue-100 text-blue-700 text-xs">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedPersona.specialized_tasks?.length > 0 && (
                  <div>
                    <Label className="text-xs text-slate-600 mb-2 block">Specialized Tasks</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPersona.specialized_tasks.map((task, idx) => (
                        <div key={idx} className="text-sm text-slate-700 flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                          <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <Label className="text-xs text-blue-900 font-semibold mb-2 block">Communication Style</Label>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-slate-600">Tone: </span>
                        <span className="text-slate-900 font-semibold">{selectedPersona.communication_style?.tone}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Verbosity: </span>
                        <span className="text-slate-900 font-semibold">{selectedPersona.communication_style?.verbosity}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Emojis: </span>
                        <span className="text-slate-900 font-semibold">
                          {selectedPersona.communication_style?.emoji_usage ? "Yes ✓" : "No"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4 mt-4">
                <Card className="bg-white border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-900">Performance Trends (Last 4 Weeks)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={performanceTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6b7280" />
                        <YAxis domain={[0.8, 1]} tick={{ fontSize: 11 }} stroke="#6b7280" />
                        <Tooltip
                          formatter={(value) => `${(value * 100).toFixed(1)}%`}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '11px'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="satisfaction" stroke="#10b981" strokeWidth={2} name="Satisfaction" />
                        <Line type="monotone" dataKey="success" stroke="#3b82f6" strokeWidth={2} name="Success Rate" />
                        <Line type="monotone" dataKey="quality" stroke="#8b5cf6" strokeWidth={2} name="Quality" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-900">Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">Response Speed</span>
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">Excellent</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">Accuracy</span>
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">High</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">Task Completion</span>
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">Reliable</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-900">Areas for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">Complex Queries</span>
                          <Badge className="bg-amber-100 text-amber-700 text-xs">Moderate</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">Edge Cases</span>
                          <Badge className="bg-amber-100 text-amber-700 text-xs">Learning</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4 mt-4">
                <Card className="bg-white border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-900">Recent Conversations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mockConversations.map((conv) => (
                        <Card key={conv.id} className="border-2 border-slate-200 hover:bg-slate-50 transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900 mb-1">{conv.user_query}</p>
                                <div className="text-xs text-slate-600">{conv.timestamp}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={cn(
                                  "text-xs",
                                  conv.response_quality >= 0.95 ? "bg-emerald-100 text-emerald-700" :
                                  conv.response_quality >= 0.85 ? "bg-blue-100 text-blue-700" :
                                  "bg-amber-100 text-amber-700"
                                )}>
                                  {(conv.response_quality * 100).toFixed(0)}% quality
                                </Badge>
                                <Badge className="bg-slate-100 text-slate-700 text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {conv.duration_ms}ms
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-900">247</div>
                      <div className="text-xs text-blue-700">Total Conversations</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <Zap className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-900">1.2s</div>
                      <div className="text-xs text-purple-700">Avg Response Time</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                      <div className="text-2xl font-bold text-emerald-900">+12%</div>
                      <div className="text-xs text-emerald-700">Quality Improvement</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="config" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-600 mb-2 block">Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        selectedPersona.status === "active" ? "bg-emerald-100 text-emerald-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {selectedPersona.status}
                      </Badge>
                      {selectedPersona.status === "testing" && (
                        <Button
                          size="sm"
                          onClick={() => handleActivate(selectedPersona)}
                          className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600 mb-2 block">Assigned Missions</Label>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedPersona.assigned_missions?.length || 0}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">System Prompt</Label>
                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 text-xs font-mono text-emerald-400 max-h-48 overflow-y-auto">
                    {selectedPersona.system_prompt}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Capabilities Matrix</Label>
                  <div className="space-y-2">
                    {[
                      { capability: "Natural Language Understanding", score: 0.96 },
                      { capability: "Context Retention", score: 0.92 },
                      { capability: "Task Execution", score: 0.94 },
                      { capability: "Error Handling", score: 0.89 },
                      { capability: "Creativity", score: 0.87 }
                    ].map((cap, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-700">{cap.capability}</span>
                          <span className="font-bold text-slate-900">{(cap.score * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={cap.score * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="text-xs font-semibold text-purple-900 mb-2">Training Data</div>
                    <div className="space-y-1 text-xs text-slate-700">
                      <div>• 12,847 conversation examples</div>
                      <div>• 4,231 task completions</div>
                      <div>• Last updated: 2 days ago</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setDetailDialogOpen(false);
                setSelectedPersona(selectedPersona);
                setTrainingModuleOpen(true);
              }}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Train This Persona
            </Button>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedPersona?.status === "testing" && (
              <Button
                onClick={() => {
                  handleActivate(selectedPersona);
                  setDetailDialogOpen(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Activate Persona
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
