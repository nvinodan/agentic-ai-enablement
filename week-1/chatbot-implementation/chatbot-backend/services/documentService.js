/**
 * Document Service
 * Handles loading, processing, and retrieving documents for RAG
 */
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { AzureOpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import path from "path";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

// Directory containing documents
const DOCS_DIR = path.join(process.cwd(), "docs");

// In-memory document store (for backup)
let documentChunks = [];
// FAISS vector store
let vectorStore = null;

// Initialize embeddings model
const embeddings = new AzureOpenAIEmbeddings({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME || process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_VERSION,
});

/**
 * Initialize the document service by loading all documents and creating FAISS index
 */
export async function initializeDocumentService() {
  try {
    console.log("Initializing document service...");
    
    // Load all documents recursively
    documentChunks = await loadAllDocuments();
    
    if (documentChunks.length === 0) {
      console.warn("No documents found to index");
      return;
    }
    
    console.log(`Loaded ${documentChunks.length} document chunks`);
    
    // Create FAISS vector store
    await createVectorStore();
    
    console.log("Document service initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing document service:", error);
    throw new Error("Failed to initialize document service");
  }
}

/**
 * Create a FAISS vector store from documents
 */
async function createVectorStore() {
  try {
    console.log("Creating FAISS vector store...");
    
    // Create vector store directly in memory without saving to disk
    vectorStore = await FaissStore.fromDocuments(documentChunks, embeddings);
    
    console.log("FAISS vector store created successfully");
  } catch (error) {
    console.error("Error creating vector store:", error);
    throw new Error("Failed to create vector store");
  }
}

/**
 * Load all documents from the docs directory
 * @returns {Promise<Array>} - Array of document chunks
 */
async function loadAllDocuments() {
  try {
    const allDocuments = [];
    
    // Recursively find all PDF files
    const pdfFiles = findPdfFiles(DOCS_DIR);
    
    // Process each PDF file
    for (const pdfPath of pdfFiles) {
      const loader = new PDFLoader(pdfPath);
      const docs = await loader.load();
      
      // Add metadata about the source file
      const relativePath = path.relative(DOCS_DIR, pdfPath);
      docs.forEach(doc => {
        doc.metadata.source = relativePath;
      });
      
      // Split documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      const chunks = await textSplitter.splitDocuments(docs);
      allDocuments.push(...chunks);
    }
    
    return allDocuments;
  } catch (error) {
    console.error("Error loading documents:", error);
    throw new Error("Failed to load documents");
  }
}

/**
 * Find all PDF files in a directory recursively
 * @param {string} dir - Directory to search
 * @returns {Array<string>} - Array of PDF file paths
 */
function findPdfFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      results = results.concat(findPdfFiles(itemPath));
    } else if (item.toLowerCase().endsWith('.pdf')) {
      results.push(itemPath);
    }
  }
  
  return results;
}

/**
 * Vector-based search for relevant documents using FAISS
 * @param {string} query - The search query
 * @param {number} k - Number of results to return
 * @returns {Promise<Array>} - Array of relevant documents with their content and metadata
 */
export async function searchDocuments(query, k = 5) {
  if (!vectorStore) {
    if (documentChunks.length === 0) {
      throw new Error("Document service not initialized");
    }
    // Fallback to keyword search if vector store is not available
    return keywordSearch(query, k);
  }
  
  try {
    console.log(`Performing vector search for: "${query}"`);
    
    // Perform similarity search using FAISS
    const results = await vectorStore.similaritySearch(query, k);
    
    console.log(`Found ${results.length} relevant documents`);
    return results;
  } catch (error) {
    console.error("Error searching documents with FAISS:", error);
    console.log("Falling back to keyword search...");
    
    // Fallback to keyword search if vector search fails
    return keywordSearch(query, k);
  }
}

/**
 * Fallback keyword-based search for relevant documents
 * @param {string} query - The search query
 * @param {number} k - Number of results to return
 * @returns {Promise<Array>} - Array of relevant documents with their content and metadata
 */
function keywordSearch(query, k = 5) {
  try {
    // Simple keyword search (not as effective as vector search but works as fallback)
    const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    // Score each document chunk based on keyword matches
    const scoredChunks = documentChunks.map(chunk => {
      const content = chunk.pageContent.toLowerCase();
      let score = 0;
      
      // Count keyword occurrences
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, 'gi');
        const matches = content.match(regex);
        if (matches) {
          score += matches.length;
        }
      }
      
      return { chunk, score };
    });
    
    // Sort by score and take top k results
    const results = scoredChunks
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(item => item.chunk);
    
    // If no results found, return a few random chunks
    if (results.length === 0) {
      return documentChunks.slice(0, k);
    }
    
    return results;
  } catch (error) {
    console.error("Error in keyword search:", error);
    throw new Error("Failed to search documents");
  }
}
