import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User } from "lucide-react";

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  readTime: number;
  trending?: boolean;
  createdAt: string;
}

interface ArticleModalProps {
  article: Article;
  trigger: React.ReactNode;
}

export function ArticleModal({ article, trigger }: ArticleModalProps) {
  const fullContent = `
# ${article.title}

${article.content.replace('...', '')}

## Understanding the Basics

This comprehensive guide covers everything you need to know about ${article.title.toLowerCase()}. Our medical experts have compiled evidence-based information to help you make informed decisions about your health.

### Key Points to Remember

1. **Early Detection**: Regular monitoring and awareness of symptoms can lead to better outcomes.

2. **Lifestyle Factors**: Diet, exercise, and stress management play crucial roles in prevention and management.

3. **Professional Guidance**: Always consult with healthcare professionals for personalized advice.

4. **Treatment Options**: Modern medicine offers various approaches tailored to individual needs.

### When to Seek Medical Attention

- Persistent or worsening symptoms
- Sudden onset of severe symptoms
- Any concerns about your health status
- Regular check-ups for prevention

### Additional Resources

For more detailed information, consider consulting with your healthcare provider or visiting reputable medical websites. Remember, this article is for educational purposes and should not replace professional medical advice.

*This content was generated to provide general health information and should not be used as a substitute for professional medical advice, diagnosis, or treatment.*
  `;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{article.title}</DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(article.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime} min read
            </div>
            <Badge variant="secondary">{article.category}</Badge>
            {article.trending && (
              <Badge variant="destructive">Trending</Badge>
            )}
          </div>
        </DialogHeader>
        
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="whitespace-pre-wrap leading-relaxed">
            {fullContent}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}