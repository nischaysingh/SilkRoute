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
import { User, Plus, Edit, Trash2, Eye, Sparkles, Check, Brain, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const PERSONALITY_TRAITS = [
  "Analytical", "Creative", "Detail-oriented", "Strategic", "Empathetic",
  "Decisive", "Collaborative", "Proactive", "Methodical", "Innovative"
];

const KNOWLEDGE_DOMAINS = [
  "Finance", "Operations", "Engineering", "Sales", "Marketing",
  "Customer Service", "Data Analysis", "Compliance", "HR", "Legal"
];

export default function PersonaBuilder() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(null);
  
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          AI Agent Personas
        </h3>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Persona
        </Button>
      </div>

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
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={cn(
                  "border-2",
                  persona.status === "active" ? "border-emerald-300 bg-emerald-50" :
                  persona.status === "testing" ? "border-blue-300 bg-blue-50" :
                  "border-slate-300 bg-slate-50 opacity-70"
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
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
                    <div className="mb-4 p-2 bg-white rounded border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">Style</div>
                      <div className="flex items-center gap-2 text-xs">
                        <MessageSquare className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-900">{persona.communication_style?.tone}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-900">{persona.communication_style?.verbosity}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPersona(persona);
                          setDetailDialogOpen(true);
                        }}
                        className="flex-1 h-8 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {persona.status === "testing" && (
                        <Button
                          size="sm"
                          onClick={() => handleActivate(persona)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              {selectedPersona?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedPersona && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700">{selectedPersona.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Status</Label>
                  <Badge className={cn(
                    selectedPersona.status === "active" ? "bg-emerald-100 text-emerald-700" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {selectedPersona.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Assigned Missions</Label>
                  <span className="text-sm font-bold text-slate-900">
                    {selectedPersona.assigned_missions?.length || 0}
                  </span>
                </div>
              </div>

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

              {selectedPersona.specialized_tasks?.length > 0 && (
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Specialized Tasks</Label>
                  <div className="space-y-1">
                    {selectedPersona.specialized_tasks.map((task, idx) => (
                      <div key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                        <Check className="w-3 h-3 text-emerald-600" />
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Label className="text-xs text-blue-900 font-semibold mb-2 block">Communication Style</Label>
                <div className="grid grid-cols-3 gap-2 text-xs">
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
                      {selectedPersona.communication_style?.emoji_usage ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedPersona.system_prompt && (
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">System Prompt</Label>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-mono text-slate-700 max-h-32 overflow-y-auto">
                    {selectedPersona.system_prompt}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}