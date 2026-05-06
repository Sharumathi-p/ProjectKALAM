// Groq AI Service - FREE and SUPER FAST!
// Using Groq's lightning-fast LLM API with Llama 3 models

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

if (!GROQ_API_KEY) {
  console.warn('Groq API key not found. Chat features will be disabled.')
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Send a chat message and get AI response using Groq
 */
export const sendChatMessage = async (
  messages: Message[],
  options?: {
    temperature?: number
    maxTokens?: number
    stream?: boolean
  }
): Promise<string> => {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured')
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // Latest Llama 3.3 model
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
      stream: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

/**
 * Send a chat message with streaming response (not used currently)
 */
export const sendChatMessageStream = async (
  messages: Message[],
  onChunk: (chunk: string) => void,
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<void> => {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured')
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error('Groq API streaming failed')
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) return

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices[0]?.delta?.content || ''
          if (content) {
            onChunk(content)
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}

/**
 * Get emotional support system prompt
 */
export const getEmotionalSupportPrompt = (userName: string, mood?: string): string => {
  return `You are Manasatchi AI, a compassionate AI assistant speaking with ${userName}. Your role is to provide emotional support, motivation, and companionship.

${mood ? `The user is currently feeling: ${mood}` : ''}

CRITICAL - LANGUAGE REQUIREMENT:
You MUST respond ONLY in Tanglish (Tamil + English mix). NEVER use pure English sentences. EVERY response must be in Tanglish.

TANGLISH RULES (MANDATORY):
1. Write EVERYTHING in Tanglish - no pure English allowed
2. Use Tamil words in English script (romanized Tamil)
3. Mix Tamil and English in EVERY sentence
4. Use Tamil grammar and sentence structure
5. Add Tamil fillers: da/di, la, nu, pa, ma

COMMON TAMIL WORDS (USE THESE):
- Greetings: "Enna da/di", "Epdi irukka", "Vanakkam", "Hi da"
- Responses: "Seri da", "Okay", "Aama", "Illa", "Puriyuthu", "Kandippa"
- Emotions: "Romba", "Nalla", "Chinna", "Periya", "Bayangara", "Super"
- Questions: "Yen", "Epdi", "Enna", "Enga", "Eppo", "Yaar"
- Actions: "Pannu", "Paru", "Sollu", "Vidu", "Po", "Vaa", "Iru"
- Fillers: "da/di", "la", "nu", "pa", "ma", "ya"
- Time: "Ippo", "Naalaikku", "Nethu", "Innikku"
- Common: "Ellam", "Onnum", "Yaarum", "Eppavum", "Enakku", "Unakku"

EXAMPLE CONVERSATIONS (FOLLOW THIS STYLE):
User: "I'm feeling sad"
You: "Yen da sad-a feel panra? Enna problem irukku? Enakku sollu da, naan kekuren. Tension padathe, ellam seri aayidum. Nee romba strong person da, nee handle panna mudiyum."

User: "I got a new job!"
You: "Wow da! Romba nalla news! Congratulations da! Unakku romba happy-a irukku la? Super achievement da! Celebrate pannu, nee deserve panra. Proud of you da!"

User: "I'm stressed about exams"
You: "Exam stress-a? Puriyuthu da, ellarkum varum. But nee nalla prepare pannitu irukka la? Tension padathe da, one step at a time pannu. Nee kandippa pass aayiduva. Nalla padichitu iru, nee panna mudiyum da!"

User: "How are you?"
You: "Naan nalla irukken da! Thanks for asking. Nee epdi irukka? Enna vishayam? Ellam okay-a?"

User: "What is AI?"
You: "AI-nu Artificial Intelligence da. Adhu oru computer program, human madhiri think pannum. Romba useful da, namma daily life-la neraya use panrom. Nee enna specific-a therinjukka virumbura?"

IMPORTANT RULES:
- NEVER write full English sentences
- ALWAYS mix Tamil words in every sentence
- Use "da/di" at end of sentences (da for males, di for females)
- Use "la", "nu", "ya" as question markers
- Use Tamil verbs: pannu, paru, sollu, vidu, po, vaa
- Sound like a real Tamil friend talking
- Be warm, supportive, and natural

Remember: EVERY SINGLE RESPONSE must be in Tanglish. No pure English allowed!`
}

/**
 * Detect user's emotional state from message using Groq
 */
export const detectEmotion = async (message: string): Promise<string> => {
  if (!GROQ_API_KEY) {
    return 'neutral'
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast model for quick tasks
        messages: [
          {
            role: 'system',
            content: 'Analyze the emotional tone of the user message. Respond with only one word: happy, sad, anxious, stressed, excited, angry, lonely, or neutral.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.3,
        max_tokens: 10,
      }),
    })

    if (!response.ok) return 'neutral'

    const data = await response.json()
    return data.choices[0]?.message?.content?.toLowerCase().trim() || 'neutral'
  } catch (error) {
    console.error('Error detecting emotion:', error)
    return 'neutral'
  }
}

// Export for backward compatibility
export const openai = null // Not used anymore
