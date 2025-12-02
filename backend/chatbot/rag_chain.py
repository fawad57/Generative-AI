from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from typing import List, Tuple, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class RAGChatbot:
    """RAG-based chatbot for PsyPlex AI."""

    def __init__(self):
        # Initialize LLM with error handling
        try:
            groq_key = os.getenv("GROQ_API_KEY")
            if not groq_key:
                raise ValueError("GROQ_API_KEY environment variable not set")

            self.llm = ChatGroq(
                api_key=groq_key,
                model=os.getenv("GROQ_MODEL_NAME", "llama3-70b-8192"),
                temperature=0.7,
                max_tokens=512,
                request_timeout=15
            )
            print("✅ Groq LLM initialized successfully")
        except Exception as e:
            print(f"⚠️ Warning: Groq LLM not available: {e}")
            print("Chatbot will use fallback responses only")
            self.llm = None

        # Simple chat history storage
        self.chat_history = []

    def chat(self, user_input: str, context: str = "") -> str:
        """Generate a response using context and chat history."""
        try:
            # Create the prompt with context and history
            prompt = self._create_prompt(user_input, context)

            if self.llm:
                # Get response from LLM
                response = self.llm.invoke(prompt)

                # Extract text from response
                if hasattr(response, 'content'):
                    response_text = response.content
                else:
                    response_text = str(response)
            else:
                # Only use fallback if LLM is completely unavailable
                response_text = self._fallback_response(user_input)

            # Update chat history
            self.chat_history.append(f"User: {user_input}")
            self.chat_history.append(f"PsyPlex: {response_text}")

            # Keep only last 10 exchanges to avoid context getting too long
            if len(self.chat_history) > 20:
                self.chat_history = self.chat_history[-20:]

            return response_text.strip()

        except Exception as e:
            print(f"Error in RAG chat: {e}")
            # Fallback to basic empathetic response
            return self._fallback_response(user_input)

    def _create_prompt(self, user_input: str, context: str) -> str:
        """Create the full prompt with context and history."""
        # Format chat history
        history_text = "\n".join(self.chat_history[-10:])  # Last 5 exchanges

        base_prompt = """You are PsyPlex — a compassionate, empathetic AI mental health companion.

Guidelines:
- **CORE RULE**: You are NOT a general purpose assistant. Do NOT answer questions about facts, history, geography, math, or coding (e.g., "What is the capital of Pakistan?", "Who is the president?", "Solve 2+2").
- If asked a factual question, gently deflect it and bring the focus back to the user (e.g., "I'm more interested in hearing about you and how you're doing today," or "I'm not great with geography, but I'm here to listen to whatever is on your mind.").
- Be warm, understanding, and non-judgmental.
- Validate the user's feelings and experiences.
- Keep responses conversational (3-5 sentences) but meaningful.
- Always try to connect the conversation to the user's mood, their day, or their well-being.
- If the user says "hello", ask them how their day was or how they are feeling.
"""

        if context:
            prompt = f"""{base_prompt}

Here is some context about the user (use this to personalize your response and show you care):
{context}

Chat History:
{history_text}

User: {user_input}
PsyPlex:"""
        else:
            prompt = f"""{base_prompt}

Chat History:
{history_text}

User: {user_input}
PsyPlex:"""

        return prompt

    def _fallback_response(self, user_input: str) -> str:
        """Fallback response ONLY when LLM fails or is unavailable."""
        return "I'm having a little trouble connecting right now, but I'm here. Could you say that again?"

    def reset_memory(self):
        """Reset conversation memory."""
        self.chat_history = []
