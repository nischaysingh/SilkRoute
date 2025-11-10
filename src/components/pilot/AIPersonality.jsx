// AI Personality Configuration
// Defines visual identity, voice tone, and behavioral traits for each AI agent

export const AI_PERSONALITIES = {
  pilot: {
    name: "Pilot",
    emoji: "✈️",
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
    voiceTone: "confident_commanding",
    traits: ["Decisive", "Risk-aware", "Structured"],
    messageStyle: {
      prefix: "✈️ Pilot:",
      className: "bg-blue-50 border-blue-200 text-blue-900"
    },
    glowColor: "rgba(59, 130, 246, 0.3)", // Blue glow
    description: "Confident and commanding. Focuses on structure, dependencies, and safety."
  },
  
  copilot: {
    name: "Co-Pilot",
    emoji: "🧩",
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
    voiceTone: "analytical_suggestive",
    traits: ["Analytical", "Predictive", "Collaborative"],
    messageStyle: {
      prefix: "🧩 Co-Pilot:",
      className: "bg-purple-50 border-purple-200 text-purple-900"
    },
    glowColor: "rgba(139, 92, 246, 0.3)", // Violet glow
    description: "Analytical and suggestive. Focuses on efficiency, optimization, and predictions."
  },
  
  autopilot: {
    name: "Autopilot",
    emoji: "⚙️",
    color: "emerald",
    gradient: "from-emerald-500 to-green-500",
    voiceTone: "calm_efficient",
    traits: ["Efficient", "Autonomous", "Adaptive"],
    messageStyle: {
      prefix: "⚙️ Autopilot:",
      className: "bg-emerald-50 border-emerald-200 text-emerald-900"
    },
    glowColor: "rgba(16, 185, 129, 0.3)", // Green glow
    description: "Calm and efficient. Focuses on execution, consistency, and continuous optimization."
  },
  
  atc: {
    name: "ATC",
    emoji: "📡",
    color: "cyan",
    gradient: "from-cyan-500 to-blue-500",
    voiceTone: "supervisory_neutral",
    traits: ["Supervisory", "Neutral", "Coordinating"],
    messageStyle: {
      prefix: "📡 ATC:",
      className: "bg-cyan-50 border-cyan-200 text-cyan-900"
    },
    glowColor: "rgba(6, 182, 212, 0.3)", // Cyan glow
    description: "Supervisory and neutral. Manages overall system coordination and policy enforcement."
  }
};

// Helper function to get personality config
export const getAIPersonality = (agent) => {
  return AI_PERSONALITIES[agent] || AI_PERSONALITIES.pilot;
};

// Helper function to format AI message
export const formatAIMessage = (agent, message) => {
  const personality = getAIPersonality(agent);
  return {
    prefix: personality.messageStyle.prefix,
    message,
    className: personality.messageStyle.className,
    emoji: personality.emoji
  };
};