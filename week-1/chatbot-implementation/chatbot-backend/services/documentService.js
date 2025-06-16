/**
 * Document Service
 * Handles loading, processing, and retrieving documents for RAG
 */
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import path from "path";
import fs from "fs";

// Directory containing documents
const DOCS_DIR = path.join(process.cwd(), "docs");

// In-memory document store
let documentChunks = [];

/**
 * Initialize the document service by loading all documents
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
    console.log("Document service initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing document service:", error);
    throw new Error("Failed to initialize document service");
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
 * Simple keyword-based search for relevant documents
 * @param {string} query - The search query
 * @param {number} k - Number of results to return
 * @returns {Promise<Array>} - Array of relevant documents with their content and metadata
 */
export async function searchDocuments(query, k = 5) {
  if (!documentChunks || documentChunks.length === 0) {
    throw new Error("Document service not initialized");
  }
  
  try {
    // Simple keyword search (not as effective as vector search but works without embeddings)
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
    console.error("Error searching documents:", error);
    throw new Error("Failed to search documents");
  }
}
