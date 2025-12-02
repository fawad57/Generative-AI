from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from data_fetcher import DataFetcher
from vector_store import VectorStoreManager
from rag_chain import RAGChatbot

load_dotenv()

app = FastAPI(title="PsyPlex RAG Chatbot API", version="2.0.0")

# Global instances
data_fetcher = DataFetcher()
vector_manager = VectorStoreManager()
rag_chatbot = RAGChatbot()

# In-memory storage for user sessions (in production, use Redis/database)
user_sessions = {}

class ChatRequest(BaseModel):
    message: str
    reset_history: Optional[bool] = False
    user_token: Optional[str] = None  # JWT token for user data access

class ChatResponse(BaseModel):
    reply: str
    history: List[List[str]]

@app.post("/message", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """RAG-enhanced chat endpoint for PsyPlex AI."""
    global user_sessions

    try:
        user_id = "anonymous"  # Default for non-authenticated users

        # Extract user ID from token if provided
        if request.user_token:
            # In a real implementation, you'd decode the JWT to get user_id
            # For now, we'll use a hash or just "authenticated_user"
            user_id = "authenticated_user"
            data_fetcher.set_token(request.user_token)

        # Reset history if requested
        if request.reset_history:
            if user_id in user_sessions:
                del user_sessions[user_id]
            rag_chatbot.reset_memory()
            vector_manager.clear_user_data(user_id)

        # Get or create user session
        if user_id not in user_sessions:
            user_sessions[user_id] = {"history": []}

        # Fetch fresh user data for RAG context
        context = ""
        if user_id != "anonymous":
            try:
                print(f"Fetching data for user: {user_id}")
                user_data = data_fetcher.fetch_all_user_data()
                
                # Log what data was found
                print(f"Data fetched - Profile: {bool(user_data.get('profile'))}, History: {len(user_data.get('browsing_history', []))}, Moods: {len(user_data.get('mood_tracks', []))}")

                vector_manager.update_user_data(user_data, user_id)

                # Get retriever and fetch relevant context
                retriever = vector_manager.get_retriever(user_id)
                if retriever:
                    # Get relevant documents for context
                    print(f"Retrieving context for query: '{request.message}'")
                    docs = retriever.get_relevant_documents(request.message, k=3)
                    
                    if docs:
                        print(f"Found {len(docs)} relevant documents")
                        context = "\n".join([doc.page_content for doc in docs])
                    else:
                        print("No relevant documents found for context")
            except Exception as e:
                print(f"Error fetching user data or context: {e}")
                # Continue without RAG if data fetch fails

        # Generate response
        user_input = request.message
        response = rag_chatbot.chat(user_input, context=context)

        # Update history
        user_sessions[user_id]["history"].append([user_input, response])

        return ChatResponse(reply=response, history=user_sessions[user_id]["history"])

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        # Fallback response
        fallback_reply = "I'm here to listen. How are you feeling right now?"
        return ChatResponse(reply=fallback_reply, history=[["Error occurred", fallback_reply]])

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "PsyPlex RAG Chatbot"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("CHATBOT_PORT", 9000))
    uvicorn.run(app, host="0.0.0.0", port=port)
