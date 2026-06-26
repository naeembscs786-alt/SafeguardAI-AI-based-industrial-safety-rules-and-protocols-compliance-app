import os
os.environ["USE_TF"] = "0"
import pickle
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

load_dotenv()

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Datasets'))
FAISS_INDEX_PATH = os.path.join(os.path.dirname(__file__), "faiss_index")

# Initialize LLM
llm = ChatGroq(
    model_name="llama-3.3-70b-versatile", 
    temperature=0, 
    max_tokens=None,
    timeout=None,
    max_retries=2,
)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def build_vector_store():
    print("Building vector store from datasets...")
    documents = []
    
    # Load all PDFs
    for filename in os.listdir(DATASETS_DIR):
        if filename.endswith(".pdf"):
            file_path = os.path.join(DATASETS_DIR, filename)
            try:
                loader = PyPDFLoader(file_path)
                documents.extend(loader.load())
                print(f"Loaded {filename}")
            except Exception as e:
                print(f"Error loading {filename}: {e}")
                
    # Load pkl if exists
    pkl_path = os.path.join(DATASETS_DIR, "aramco_chunks.pkl")
    if os.path.exists(pkl_path):
        try:
            with open(pkl_path, 'rb') as f:
                aramco_data = pickle.load(f)
                # Assume aramco_data is a list of strings or dicts
                from langchain_core.documents import Document
                for chunk in aramco_data:
                    text = chunk.get('text', str(chunk)) if isinstance(chunk, dict) else str(chunk)
                    documents.append(Document(page_content=text, metadata={"source": "aramco_chunks.pkl"}))
            print("Loaded aramco_chunks.pkl")
        except Exception as e:
            print(f"Error loading pkl: {e}")

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    split_docs = text_splitter.split_documents(documents)
    
    print(f"Created {len(split_docs)} chunks. Building FAISS index...")
    vectorstore = FAISS.from_documents(split_docs, embeddings)
    vectorstore.save_local(FAISS_INDEX_PATH)
    print("Vector store saved successfully!")
    return vectorstore

def get_vector_store():
    if os.path.exists(FAISS_INDEX_PATH):
        try:
            return FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
        except Exception as e:
            print("Error loading existing vector store:", e)
            return build_vector_store()
    else:
        return build_vector_store()

# Initialize retrieving chain
prompt = ChatPromptTemplate.from_template(
    """You are a helpful, highly accurate, and friendly AI Safety Assistant.
    Answer the user's question based strictly on the provided context. 
    IMPORTANT: If the user is asking to translate, rephrase, or continue the previous conversation (e.g. saying "in english" or "explain more"), you MUST use the <chat_history> to fulfill their request, even if the new context doesn't contain the answer.
    If the answer is not in the context or chat history, say "I don't have enough information from the safety manuals to answer that." but try to be as helpful as possible.
    Always prioritize safety and accurate protocols.
    
    IMPORTANT RULES:
    1. ALWAYS reply in the exact same language that the user used to ask the question (e.g. if asked in Roman Urdu, reply in Roman Urdu. If asked in pure Urdu, reply in pure Urdu. If English, reply in English).
    2. Your answer must be very clear, simple, and easy to understand.
    3. NEVER mention any specific company names (like "Saudi Aramco", "OGDCL", etc.) in your response, even if it is present in the context. Simply refer to it as "the company" or "the organization" if needed.
    
    <chat_history>
    {chat_history}
    </chat_history>
    
    <context>
    {context}
    </context>

    Question: {input}
"""
)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def format_chat_history(history_list):
    if not history_list:
        return "No previous history."
    formatted = []
    # Take only the last 6 messages to keep context window clean
    for msg in history_list[-6:]:
        sender = "User" if msg.get("sender") == "user" else "Assistant"
        formatted.append(f"{sender}: {msg.get('text', '')}")
    return "\n".join(formatted)

# Global variables for lazy initialization
vectorstore = None
rag_chain = None

def get_chatbot_response(user_query: str, chat_history: list = None) -> str:
    global vectorstore, rag_chain
    
    if chat_history is None:
        chat_history = []
        
    # Lazy initialize vectorstore and rag_chain
    if vectorstore is None:
        print("🤖 Initializing Chatbot Vector Store...")
        vectorstore = get_vector_store()
        
    if rag_chain is None:
        print("🤖 Initializing RAG Chain...")
        retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
        rag_chain = (
            {
                "context": lambda x: format_docs(retriever.invoke(x["input"])),
                "input": lambda x: x["input"],
                "chat_history": lambda x: format_chat_history(x.get("chat_history", []))
            }
            | prompt
            | llm
            | StrOutputParser()
        )
    
    return rag_chain.invoke({"input": user_query, "chat_history": chat_history})

if __name__ == "__main__":
    # Test
    print("Testing chatbot...")
    print(get_chatbot_response("What is the PPE requirement for height work?"))
