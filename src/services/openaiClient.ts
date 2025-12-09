/**
 * OpenAI API Client
 * Handles communication with GPT models for content generation
 */

import { OpenAI } from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

// Initialize client only if API key is provided
let client: OpenAI | null = null;

if (apiKey) {
  client = new OpenAI({ apiKey });
}

export interface GptCallOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Call GPT model with a prompt
 * @param prompt The prompt to send to GPT
 * @param options Configuration options for the API call
 * @returns The generated text from GPT
 */
export async function callGpt(
  prompt: string,
  options: GptCallOptions = {}
): Promise<string> {
  if (!client || !apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not configured. Please add it to your .env file: OPENAI_API_KEY=sk-...'
    );
  }

  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 4096,
  } = options;

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert software architect helping generate technical documentation and project specifications.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from GPT');
    }

    return content;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Streaming call to GPT (returns async iterator)
 * @param prompt The prompt to send to GPT
 * @param options Configuration options for the API call
 * @returns Async iterator for streaming responses
 */
export async function* callGptStream(
  prompt: string,
  options: GptCallOptions = {}
) {
  if (!client || !apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not configured. Please add it to your .env file: OPENAI_API_KEY=sk-...'
    );
  }

  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 4096,
  } = options;

  try {
    const stream = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert software architect helping generate technical documentation and project specifications.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw error;
  }
}
