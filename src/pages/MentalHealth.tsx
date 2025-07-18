import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, TrendingUp, Calendar } from "lucide-react";
import { GroqService } from "@/lib/groq";
import { useToast } from "@/hooks/use-toast";

const moodEmojis = [
  { value: 1, emoji: "😢", label: "Very Sad" },
  { value: 2, emoji: "😕", label: "Sad" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Happy" },
  { value: 5, emoji: "😄", label: "Very Happy" },
];

export default function MentalHealth() {
  const [currentMood, setCurrentMood] = useState<number>(3);
  const [journalEntry, setJournalEntry] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMoodLog = () => {
    const moodData = {
      mood: currentMood,
      note: journalEntry,
      timestamp: new Date().toISOString(),
    };
    
    // Store in localStorage for demo
    const existingLogs = JSON.parse(localStorage.getItem('mood-logs') || '[]');
    existingLogs.push(moodData);
    localStorage.setItem('mood-logs', JSON.stringify(existingLogs));
    
    setJournalEntry("");
    toast({
      title: "Mood logged successfully",
      description: "Your mood has been recorded for today.",
    });
  };

  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await GroqService.mentalHealthAssistant(chatMessage, currentMood);
      setAiResponse(response);
      setChatMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const recentMoodLogs = JSON.parse(localStorage.getItem('mood-logs') || '[]').slice(-7);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mental Health Assistant</h1>
          <p className="text-muted-foreground">Your AI-powered mental wellness companion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Daily Mood Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">How are you feeling today?</p>
              <div className="flex gap-2 justify-center">
                {moodEmojis.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setCurrentMood(mood.value)}
                    className={`text-3xl p-2 rounded-lg transition-all ${
                      currentMood === mood.value 
                        ? "bg-primary/20 scale-110" 
                        : "hover:bg-muted"
                    }`}
                    title={mood.label}
                  >
                    {mood.emoji}
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                {moodEmojis.find(m => m.value === currentMood)?.label}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Journal Entry (Optional)</label>
              <Textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="How are you feeling? What's on your mind today?"
                className="mt-1"
                rows={3}
              />
            </div>

            <Button onClick={handleMoodLog} className="w-full">
              Log Mood
            </Button>
          </CardContent>
        </Card>

        {/* AI Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              AI Therapist Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 min-h-[200px]">
              {aiResponse ? (
                <div className="space-y-2">
                  <Badge variant="secondary">AI Therapist</Badge>
                  <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center">
                  Share your thoughts and get personalized support...
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Share what's on your mind..."
                rows={3}
              />
              <Button 
                onClick={handleChatSubmit} 
                disabled={isLoading || !chatMessage.trim()}
                className="w-full"
              >
                {isLoading ? "Getting response..." : "Send Message"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Mood Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Mood Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMoodLogs.length > 0 ? (
              <div className="space-y-3">
                {recentMoodLogs.reverse().map((log: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <span className="text-2xl">
                      {moodEmojis.find(m => m.value === log.mood)?.emoji}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {moodEmojis.find(m => m.value === log.mood)?.label}
                      </p>
                      {log.note && (
                        <p className="text-xs text-muted-foreground mt-1">{log.note}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No mood logs yet. Start tracking your mood above!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}