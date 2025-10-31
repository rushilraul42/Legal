/**
 * Script to test draft generation functionality
 * 
 * Usage: 
 *   tsx backend/src/scripts/testDraftGeneration.ts
 */

import dotenv from 'dotenv';
import { initializeDraftProcessor } from '../services/draftProcessor';
import { initializeDraftGenerator } from '../services/draftGenerator';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🧪 Testing draft generation functionality...\n');

  try {
    // Validate environment variables
    const pineconeKey = process.env.PINECONE_API_KEY || process.env.VITE_PINECONE_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.VITE_GOOGLE_AI_API_KEY;
    
    if (!pineconeKey || !geminiKey) {
      throw new Error('❌ Required API keys (PINECONE_API_KEY and GEMINI_API_KEY) not set');
    }

    // Initialize services
    console.log('📡 Initializing services...');
    const draftProcessor = await initializeDraftProcessor();
    const draftGenerator = await initializeDraftGenerator(draftProcessor);
    console.log('✅ Services initialized\n');

    // Test 1: Search for similar drafts
    console.log('🔍 Test 1: Searching for similar drafts...');
    const searchQuery = 'rental agreement between landlord and tenant';
    const searchResults = await draftProcessor.searchSimilarDrafts(searchQuery, 3);
    console.log(`Found ${searchResults.length} similar drafts:`);
    searchResults.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.filename} (score: ${result.score.toFixed(3)})`);
      console.log(`     Preview: ${result.text.substring(0, 100)}...`);
    });
    console.log('');

    // Test 2: Generate a draft
    console.log('📝 Test 2: Generating a draft...');
    const draftRequest = {
      prompt: 'Create a rental agreement for a residential property in Mumbai. The landlord is Mr. Sharma and the tenant is Ms. Patel. Monthly rent is Rs. 25,000. Security deposit is Rs. 50,000. Lease period is 11 months.',
      draftType: 'agreement',
      additionalContext: {
        parties: ['Mr. Sharma (Landlord)', 'Ms. Patel (Tenant)'],
        tone: 'formal' as const,
        specificClauses: [
          'Maintenance responsibilities',
          'Termination conditions',
          'Notice period'
        ]
      }
    };

    const generatedDraft = await draftGenerator.generateDraft(draftRequest);
    
    console.log('\n📄 Generated Draft:');
    console.log('━'.repeat(80));
    console.log(generatedDraft.draft);
    console.log('━'.repeat(80));
    
    console.log('\n📊 Metadata:');
    console.log(`  - Tokens used: ${generatedDraft.metadata.tokensUsed}`);
    console.log(`  - Processing time: ${generatedDraft.metadata.processingTime}`);
    console.log(`  - Model: ${generatedDraft.metadata.model}`);
    
    console.log('\n📚 References used:');
    generatedDraft.references.forEach((ref: any, index: number) => {
      console.log(`  ${index + 1}. ${ref.filename} (relevance: ${(ref.relevanceScore * 100).toFixed(1)}%)`);
    });
    
    if (generatedDraft.suggestions && generatedDraft.suggestions.length > 0) {
      console.log('\n💡 Suggestions for improvement:');
      generatedDraft.suggestions.forEach((suggestion: string, index: number) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    }

    console.log('\n✅ Draft generation test completed successfully!');
    
  } catch (error: any) {
    console.error('\n❌ Error during testing:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
