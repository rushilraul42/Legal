/**
 * Script to process all PDF drafts in the drafts folder and upload to Pinecone
 * 
 * Usage: 
 *   npm run process-drafts
 *   or
 *   tsx backend/src/scripts/processDrafts.ts
 */

import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeDraftProcessor } from '../services/draftProcessor';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🚀 Starting draft processing...\n');

  try {
    // Validate environment variables
    const pineconeKey = process.env.PINECONE_API_KEY || process.env.VITE_PINECONE_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.VITE_GOOGLE_AI_API_KEY;
    
    if (!pineconeKey) {
      throw new Error('❌ PINECONE_API_KEY is not set in environment variables');
    }
    if (!geminiKey) {
      throw new Error('❌ GEMINI_API_KEY is not set in environment variables');
    }

    // Initialize draft processor
    console.log('📡 Initializing draft processor...');
    const draftProcessor = await initializeDraftProcessor();
    console.log('✅ Draft processor initialized\n');

    // Get drafts folder path
    const draftsFolder = join(__dirname, '..', '..', 'drafts');
    console.log(`📁 Processing PDFs from: ${draftsFolder}\n`);

    // Process all PDFs in the folder
    await draftProcessor.processDraftsFolder(draftsFolder);

    // Get statistics
    console.log('\n📊 Fetching index statistics...');
    const stats = await draftProcessor.getStats();
    console.log('Vector database stats:', JSON.stringify(stats, null, 2));

    console.log('\n✅ Draft processing completed successfully!');
    console.log('\n💡 You can now use the draft generation API endpoints to generate new drafts.');
    
  } catch (error: any) {
    console.error('\n❌ Error processing drafts:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
