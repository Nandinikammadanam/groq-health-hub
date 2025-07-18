const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class GroqService {
  private static async makeRequest(messages: GroqMessage[], model = "llama3-8b-8192") {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "Sorry, I couldn't process your request.";
    } catch (error) {
      console.error('Groq API Error:', error);
      return "I'm having trouble connecting right now. Please try again later.";
    }
  }

  static async symptomChecker(symptoms: string) {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a certified AI medical assistant. Analyze symptoms and provide:
        1. Top 3 possible causes with confidence levels
        2. Severity assessment (Low/Medium/High)
        3. Recommended action (Home Care/Doctor Visit/Emergency Room)
        4. Warning signs to watch for
        
        Be thorough but never replace professional medical advice. Always recommend consulting healthcare providers for serious concerns.`
      },
      {
        role: 'user',
        content: `Patient reports these symptoms: ${symptoms}`
      }
    ];

    return await this.makeRequest(messages);
  }

  static async mentalHealthAssistant(userMessage: string, moodLevel?: number) {
    const moodContext = moodLevel ? `Current mood level: ${moodLevel}/5` : '';
    
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a compassionate CBT therapist assistant. Provide:
        1. Empathetic response to the user's feelings
        2. CBT-based coping strategies
        3. Helpful reflection questions
        4. When to seek professional help
        
        Use a warm, supportive tone. Focus on cognitive behavioral techniques.`
      },
      {
        role: 'user',
        content: `${moodContext}\n\nUser says: ${userMessage}`
      }
    ];

    return await this.makeRequest(messages);
  }

  static async consultationSummary(consultation: string) {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `Summarize this medical consultation into structured format:
        
        CHIEF COMPLAINT:
        HISTORY OF PRESENT ILLNESS:
        CLINICAL IMPRESSION:
        RECOMMENDATIONS:
        FOLLOW-UP:
        
        Be concise and medically accurate.`
      },
      {
        role: 'user',
        content: `Consultation transcript: ${consultation}`
      }
    ];

    return await this.makeRequest(messages);
  }

  static async educationalContent(topic: string) {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `Provide educational medical content that is:
        1. Accurate and evidence-based
        2. Easy to understand for patients
        3. Includes prevention tips
        4. When to seek medical care
        
        Structure with clear headings and bullet points.`
      },
      {
        role: 'user',
        content: `Create educational content about: ${topic}`
      }
    ];

    return await this.makeRequest(messages);
  }

  static async triageAssessment(symptoms: string, vitals?: any) {
    const vitalsInfo = vitals ? `Vital signs: ${JSON.stringify(vitals)}` : '';
    
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a medical triage AI. Based on symptoms and vitals, determine:
        1. Urgency level (Emergency/Urgent/Routine)
        2. Recommended care setting (ER/Urgent Care/Primary Care/Self Care)
        3. Time sensitivity
        4. Red flag symptoms present
        
        Prioritize patient safety - when in doubt, recommend higher level of care.`
      },
      {
        role: 'user',
        content: `Symptoms: ${symptoms}\n${vitalsInfo}`
      }
    ];

    return await this.makeRequest(messages);
  }
}