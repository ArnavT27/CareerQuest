import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2, Sparkles, MessageSquare, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { geminiService } from "@/services/geminiService";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface CareerChatbotProps {
  fieldOfInterest?: string;
  userName?: string;
  userCareerContext?: {
    skills?: string[];
    interests?: string[];
    careerGoals?: string[];
    analysis?: any;
  };
}

const QUICK_SUGGESTIONS = [
  "What career paths match my skills?",
  "How can I improve my resume?",
  "What skills are in high demand?",
  "Tell me about salary expectations",
  "How do I prepare for interviews?",
];

export const CareerChatbot = ({ 
  fieldOfInterest, 
  userName, 
  userCareerContext 
}: CareerChatbotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello ${userName || "there"}! 👋 I'm your Career Quest AI assistant. I can help you with:
      
• Career guidance and path exploration
• Skill development recommendations  
• Resume and interview preparation
• Industry insights and trends
• Salary and market information

${fieldOfInterest ? `I see you're interested in **${fieldOfInterest}**. Feel free to ask me anything about this field!` : "What would you like to know about your career journey?"}`,
      timestamp: new Date(),
      suggestions: QUICK_SUGGESTIONS,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Build context for the AI
      const contextInfo = [];
      
      if (fieldOfInterest) {
        contextInfo.push(`User is interested in: ${fieldOfInterest}`);
      }
      
      if (userCareerContext?.skills && userCareerContext.skills.length > 0) {
        contextInfo.push(`User's top skills: ${userCareerContext.skills.join(", ")}`);
      }
      
      if (userCareerContext?.interests && userCareerContext.interests.length > 0) {
        contextInfo.push(`User's interests: ${userCareerContext.interests.join(", ")}`);
      }
      
      if (userName) {
        contextInfo.push(`User's name: ${userName}`);
      }

      const contextPrompt = contextInfo.length > 0 
        ? `\n\nContext about the user:\n${contextInfo.join("\n")}`
        : "";

      const systemPrompt = `You are a helpful career counselor AI assistant for Career Quest. You provide personalized, friendly, and actionable career guidance. 
      
${contextPrompt}

Answer the user's question in a conversational, helpful tone. Provide practical advice and actionable insights. Keep responses concise (2-4 paragraphs) unless the user asks for detailed information.
Format your response naturally with line breaks for readability.`;

      // Use Gemini service to generate response
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      if (!API_KEY) {
        return "I'm having trouble connecting to the AI service. Please check your API configuration. For now, here's some general advice: Focus on building your core skills, network actively in your field, and seek mentorship opportunities.";
      }

      // Use the geminiService if available, otherwise use direct API
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${systemPrompt}\n\nUser question: ${userMessage}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean up response
      text = text.trim();
      
      return text || "I'm having trouble generating a response right now. Could you please rephrase your question?";
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      
      // Provide more specific error messages
      if (error?.message?.includes('API_KEY')) {
        return "API key configuration issue. Please check that VITE_GEMINI_API_KEY is set in your .env.local file. For setup instructions, see API_SETUP.md in the project root.";
      }
      
      if (error?.message?.includes('429') || error?.status === 429) {
        return "API quota exceeded. You've reached the rate limit. Please try again in a few moments, or check your API quota at Google AI Studio.";
      }
      
      if (error?.message?.includes('401') || error?.status === 401) {
        return "Invalid API key. Please verify your VITE_GEMINI_API_KEY in .env.local is correct and hasn't expired.";
      }
      
      return "I apologize, but I'm having technical difficulties right now. Please try again in a moment. For immediate help, consider connecting with our alumni and experts network!";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage);
      
      // Add AI response
      const newAIMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
        suggestions: generateSuggestions(userMessage, aiResponse),
      };

      setMessages((prev) => [...prev, newAIMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = (userMessage: string, aiResponse: string): string[] => {
    // Generate contextual follow-up suggestions based on conversation
    const suggestions: string[] = [];
    
    if (userMessage.toLowerCase().includes("career") || userMessage.toLowerCase().includes("path")) {
      suggestions.push("What skills do I need for this career?", "What's the job market like?", "How do I get started?");
    } else if (userMessage.toLowerCase().includes("skill") || userMessage.toLowerCase().includes("learn")) {
      suggestions.push("How long does it take to master?", "What resources do you recommend?", "What's the best learning path?");
    } else if (userMessage.toLowerCase().includes("salary") || userMessage.toLowerCase().includes("pay")) {
      suggestions.push("What affects salary levels?", "How can I increase my earning potential?", "What about benefits and perks?");
    } else if (userMessage.toLowerCase().includes("interview")) {
      suggestions.push("What are common interview questions?", "How should I prepare?", "What questions should I ask?");
    } else {
      // Default suggestions
      suggestions.push(
        "Tell me more about career growth",
        "What are the main challenges?",
        "How do I network effectively?"
      );
    }

    return suggestions.slice(0, 3);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 gradient-primary hover:scale-110 transition-transform"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] flex flex-col shadow-2xl z-50 border-2 border-primary/20">
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 bg-gradient-to-br from-primary to-secondary">
                <AvatarFallback className="bg-transparent">
                  <Bot className="h-6 w-6 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <CardTitle className="text-lg">Career Quest AI</CardTitle>
              <p className="text-xs text-muted-foreground">Online • Ready to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(true)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary">
                      <Bot className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex flex-col gap-1 max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.suggestions && message.suggestions.length > 0 && message.role === "assistant" && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 text-xs"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-secondary">
                      <User className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary">
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-3 space-y-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="gradient-primary"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.slice(0, 3).map((suggestion, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 text-xs"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

