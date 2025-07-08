// Simple test script for favorite functionality
// This script demonstrates how to use the new favorite API endpoint

const axios = require('axios');
const baseURL = 'http://localhost:5000/api/flashcards';

// Test data
const testFlashcardId = '60d5f484f1b2c72d9c8b4567'; // Replace with actual flashcard ID

// Function to test favorite functionality
async function testFavorite() {
  console.log('Testing Favorite Functionality...\n');
  
  try {
    // Test 1: Mark flashcard as favorite
    console.log('1. Marking flashcard as favorite...');
    const response1 = await axios.put(`${baseURL}/favorite/${testFlashcardId}`, {
      favorite: true
    });
    
    console.log('✓ Success:', response1.data);
    console.log('   Favorite status:', response1.data.favorite);
    
    // Test 2: Remove flashcard from favorites
    console.log('\n2. Removing flashcard from favorites...');
    const response2 = await axios.put(`${baseURL}/favorite/${testFlashcardId}`, {
      favorite: false
    });
    
    console.log('✓ Success:', response2.data);
    console.log('   Favorite status:', response2.data.favorite);
    
    // Test 3: Verify favorite status in GET request
    console.log('\n3. Verifying favorite status in GET request...');
    const response3 = await axios.get(`${baseURL}/all`);
    
    const flashcard = response3.data.flashcards.find(f => f.id === testFlashcardId);
    if (flashcard) {
      console.log('✓ Found flashcard in GET response:', flashcard.favorite);
    } else {
      console.log('Flashcard not found in GET response');
    }
    
    console.log('\nAll tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

// Run the test
testFavorite();
