/**
 * Simple test script to verify the book API works
 */

// Test the mock database directly
import mockSql from './apps/web/src/app/api/utils/mock-db.js';

async function testMockDb() {
  console.log('🧪 Testing mock database...');
  
  try {
    // Test inserting a book
    console.log('➕ Inserting book...');
    const books = await mockSql`
      INSERT INTO books (
        user_id, title, author, isbn, publisher, publication_year,
        genre, cover_image_url, page_count, description, language,
        format, condition, physical_location, date_acquired, status
      ) VALUES (
        ${'test-user-123'}, ${'Test Book'}, ${'Test Author'}, ${null}, ${null}, ${null},
        ${null}, ${null}, ${null}, ${null}, ${null},
        ${null}, ${null}, ${null}, ${null}, ${'unread'}
      )
      RETURNING *
    `;
    
    console.log('✅ Insert result:', books);
    
    // Test querying books
    console.log('📚 Querying books...');
    const queriedBooks = await mockSql`SELECT * FROM books WHERE user_id = ${'test-user-123'}`;
    
    console.log('✅ Query result:', queriedBooks);
    
    if (queriedBooks.length > 0) {
      console.log('🎉 Mock database is working correctly!');
    } else {
      console.log('❌ No books found in mock database');
    }
    
  } catch (error) {
    console.error('❌ Error testing mock database:', error);
  }
}

testMockDb();