import chromadb
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class VectorStoreManager:
    """Manages vector store for user data embeddings."""

    def __init__(self, collection_name: str = "psyplex_user_data"):
        self.collection_name = collection_name

        # Initialize embeddings with error handling
        try:
            openai_key = os.getenv("OPENAI_API_KEY")
            if not openai_key:
                raise ValueError("OPENAI_API_KEY environment variable not set")

            self.embeddings = OpenAIEmbeddings(
                api_key=openai_key,
                model="text-embedding-ada-002"
            )
            print("✅ OpenAI embeddings initialized successfully")
        except Exception as e:
            print(f"⚠️ Warning: OpenAI embeddings not available: {e}")
            print("RAG functionality will be limited - using basic responses only")
            self.embeddings = None

        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.vectorstore = None

    def _prepare_documents(self, user_data: Dict[str, Any]) -> List[Document]:
        """Convert user data into LangChain documents for embedding."""
        documents = []

        # Profile data
        if user_data.get("profile"):
            profile = user_data["profile"]
            profile_text = f"""
            User Profile:
            Name: {profile.get('name', 'Unknown')}
            Age: {profile.get('age', 'Unknown')}
            Gender: {profile.get('gender', 'Unknown')}
            Bio: {profile.get('bio', 'No bio provided')}
            Interests: {', '.join(profile.get('interests', []))}
            Mental Health Goals: {', '.join(profile.get('goals', []))}
            """
            documents.append(Document(
                page_content=profile_text.strip(),
                metadata={"type": "profile", "user_id": profile.get("id")}
            ))

        # Browsing history
        if user_data.get("browsing_history"):
            history = user_data["browsing_history"]
            for item in history[:50]:  # Limit to recent 50 entries
                history_text = f"""
                Browsing Activity:
                URL: {item.get('url', '')}
                Title: {item.get('title', '')}
                Domain: {item.get('domain', '')}
                Visit Time: {item.get('visit_time', '')}
                Time Spent: {item.get('time_spent', 0)} seconds
                Category: {item.get('category', 'Unknown')}
                """
                documents.append(Document(
                    page_content=history_text.strip(),
                    metadata={
                        "type": "browsing_history",
                        "domain": item.get("domain"),
                        "category": item.get("category"),
                        "time_spent": item.get("time_spent", 0)
                    }
                ))

        # Mood tracks
        if user_data.get("mood_tracks"):
            moods = user_data["mood_tracks"]
            for mood in moods[-30:]:  # Last 30 mood entries
                mood_text = f"""
                Mood Entry:
                Mood: {mood.get('mood', 'Unknown')}
                Intensity: {mood.get('intensity', 5)}/10
                Notes: {mood.get('notes', 'No notes')}
                Date: {mood.get('date', '')}
                Triggers: {', '.join(mood.get('triggers', []))}
                """
                documents.append(Document(
                    page_content=mood_text.strip(),
                    metadata={
                        "type": "mood_track",
                        "mood": mood.get("mood"),
                        "intensity": mood.get("intensity", 5),
                        "date": mood.get("date")
                    }
                ))

        # Emotion data
        if user_data.get("emotion_data"):
            emotions = user_data["emotion_data"]
            for emotion in emotions[-20:]:  # Last 20 emotion entries
                emotion_text = f"""
                Emotion Analysis:
                Domain: {emotion.get('domain', '')}
                Emotion: {emotion.get('emotion', 'Neutral')}
                Confidence: {emotion.get('confidence', 0)}
                Date: {emotion.get('date', '')}
                """
                documents.append(Document(
                    page_content=emotion_text.strip(),
                    metadata={
                        "type": "emotion_data",
                        "domain": emotion.get("domain"),
                        "emotion": emotion.get("emotion"),
                        "confidence": emotion.get("confidence", 0)
                    }
                ))

        return documents

    def update_user_data(self, user_data: Dict[str, Any], user_id: str):
        """Update vector store with new user data."""
        try:
            # Check if embeddings are available
            if self.embeddings is None:
                print("Embeddings not available - skipping vector store update")
                return None

            # Prepare documents
            documents = self._prepare_documents(user_data)

            if not documents:
                print("No documents to embed")
                return None

            # Create or update vector store
            self.vectorstore = Chroma.from_documents(
                documents=documents,
                embedding=self.embeddings,
                client=self.client,
                collection_name=f"{self.collection_name}_{user_id}"
            )

            print(f"Updated vector store for user {user_id} with {len(documents)} documents")
            return self.vectorstore

        except Exception as e:
            print(f"Error updating vector store: {e}")
            return None

    def get_retriever(self, user_id: str, k: int = 5):
        """Get retriever for user's vector store."""
        try:
            # Check if embeddings are available
            if self.embeddings is None:
                print("Embeddings not available - cannot create retriever")
                return None

            if self.vectorstore is None:
                # Try to load existing collection
                self.vectorstore = Chroma(
                    client=self.client,
                    collection_name=f"{self.collection_name}_{user_id}",
                    embedding_function=self.embeddings
                )

            return self.vectorstore.as_retriever(search_kwargs={"k": k})

        except Exception as e:
            print(f"Error getting retriever: {e}")
            return None

    def clear_user_data(self, user_id: str):
        """Clear user's vector store data."""
        try:
            self.client.delete_collection(f"{self.collection_name}_{user_id}")
            print(f"Cleared data for user {user_id}")
        except Exception as e:
            print(f"Error clearing data for user {user_id}: {e}")
