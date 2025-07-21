import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Book, Search, TrendingUp, Clock, Heart, Brain, Activity } from "lucide-react";
import { GroqService } from "@/lib/groq";
import { useToast } from "@/hooks/use-toast";
import { ArticleModal } from "@/components/ArticleModal";

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  readTime: number;
  trending?: boolean;
  createdAt: string;
}

const categories = [
  { name: "General Health", icon: Activity, color: "bg-blue-500" },
  { name: "Mental Health", icon: Brain, color: "bg-purple-500" },
  { name: "Heart Health", icon: Heart, color: "bg-red-500" },
  { name: "Nutrition", icon: Activity, color: "bg-green-500" },
  { name: "Exercise", icon: TrendingUp, color: "bg-orange-500" },
];

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Understanding High Blood Pressure',
    category: 'Heart Health',
    content: 'High blood pressure is a common condition that affects millions...',
    readTime: 5,
    trending: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Managing Anxiety: Practical Tips',
    category: 'Mental Health',
    content: 'Anxiety is a normal response to stress, but when it becomes overwhelming...',
    readTime: 7,
    trending: true,
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    title: 'Healthy Eating for Diabetes',
    category: 'Nutrition',
    content: 'Managing diabetes through diet is crucial for maintaining stable blood sugar...',
    readTime: 6,
    createdAt: '2024-01-13'
  }
];

export default function EducationHub() {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleGenerateContent = async (topic: string) => {
    if (!topic.trim()) {
      toast({
        title: "Please enter a topic",
        description: "Enter a health topic to generate educational content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const content = await GroqService.educationalContent(topic);
      setGeneratedContent(content);
      
      // Add to articles list
      const newArticle: Article = {
        id: Math.random().toString(36),
        title: `AI Guide: ${topic}`,
        category: 'General Health',
        content: content.substring(0, 200) + '...',
        readTime: Math.ceil(content.length / 1000),
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setArticles([newArticle, ...articles]);
      
      toast({
        title: "Content generated successfully",
        description: "New educational content has been created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
          <Book className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Education Hub</h1>
          <p className="text-muted-foreground">Learn about health topics with AI-powered insights</p>
        </div>
      </div>

      {/* AI Content Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Health Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a health topic (e.g., diabetes, heart disease, meditation)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleGenerateContent(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button 
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                handleGenerateContent(input.value);
                input.value = '';
              }}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
          
          {generatedContent && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Generated Content:</h3>
              <div className="text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                {generatedContent}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'All' ? "default" : "outline"}
                onClick={() => setSelectedCategory('All')}
                size="sm"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trending Health Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {articles.filter(a => a.category === category.name).length} articles
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg leading-tight mb-2">{article.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    {article.trending && (
                      <Badge variant="destructive" className="text-xs">
                        Trending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {article.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {article.readTime} min read
                </div>
                <ArticleModal 
                  article={article}
                  trigger={
                    <Button size="sm">
                      Read More
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No articles found matching your criteria.</p>
            <Button 
              className="mt-4" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory('All');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}