/**
 * Mock Database Utility for Development
 * Provides in-memory storage when no real database is available
 */

// Create a singleton instance that persists across requests
const getMockDatabase = () => {
  if (!global.mockDb) {
    global.mockDb = new MockDatabase();
  }
  return global.mockDb;
};

class MockDatabase {
  constructor() {
    this.books = [];
    this.users = [];
    this.bookTags = [];
    this.readingProgress = [];
    this.readingSessions = [];
    this.nextId = 1;
  }

  async query(template, values = []) {
    // Handle tagged template literals
    const query = typeof template === 'string' ? template : template.toString();
    const queryLower = query.toLowerCase().trim();

    console.log(`🔍 Mock DB Query: ${queryLower.substring(0, 100)}...`);

    // Handle different query types
    if (queryLower.includes('select') && queryLower.includes('from books')) {
      return this.handleSelectBooks(query, values);
    } else if (queryLower.includes('insert into books')) {
      return this.handleInsertBooks(query, values);
    } else if (queryLower.includes('insert into book_tags')) {
      return this.handleInsertBookTags(query, values);
    } else if (queryLower.includes('insert into reading_progress')) {
      return this.handleInsertReadingProgress(query, values);
    }

    console.log(`🤷 Mock DB: Unhandled query type: ${queryLower.substring(0, 50)}...`);
    return [];
  }

  handleSelectBooks(query, values) {
    console.log(`📚 Selecting books with ${values.length} parameters`);
    let books = [...this.books];

    // Filter by user_id
    if (query.includes('user_id = $1')) {
      const userId = values[0];
      books = books.filter(book => book.user_id === userId);
      console.log(`👤 Filtered by user_id: ${userId}, found ${books.length} books`);
    }

    // Handle additional filters
    if (query.includes('status =')) {
      const statusMatch = query.match(/status = \$(\d+)/);
      if (statusMatch) {
        const statusParamIndex = parseInt(statusMatch[1]) - 1;
        const status = values[statusParamIndex];
        books = books.filter(book => book.status === status);
        console.log(`📊 Filtered by status: ${status}, found ${books.length} books`);
      }
    }

    if (query.includes('like lower($')) {
      const searchMatch = query.match(/like lower\(\$(\d+)\)/);
      if (searchMatch) {
        const searchParamIndex = parseInt(searchMatch[1]) - 1;
        const search = values[searchParamIndex]?.replace(/%/g, '').toLowerCase() || '';
        books = books.filter(book => 
          (book.title && book.title.toLowerCase().includes(search)) || 
          (book.author && book.author.toLowerCase().includes(search))
        );
        console.log(`🔍 Filtered by search: "${search}", found ${books.length} books`);
      }
    }

    // Handle sorting
    if (query.includes('order by')) {
      const sortByMatch = query.match(/order by (\w+) (asc|desc)/i);
      if (sortByMatch) {
        const [_, sortBy, order] = sortByMatch;
        books.sort((a, b) => {
          const aVal = a[sortBy] || '';
          const bVal = b[sortBy] || '';
          const comparison = aVal.localeCompare(bVal);
          return order.toLowerCase() === 'desc' ? -comparison : comparison;
        });
        console.log(`📈 Sorted by ${sortBy} ${order}`);
      }
    }

    console.log(`✅ Returning ${books.length} books`);
    return books;
  }

  handleInsertBooks(query, values) {
    console.log(`➕ Inserting book with ${values.length} parameters`);
    
    const book = {
      id: `book_${this.nextId++}`,
      user_id: values[0],
      title: values[1],
      author: values[2] || null,
      isbn: values[3] || null,
      publisher: values[4] || null,
      publication_year: values[5] || null,
      genre: values[6] || null,
      cover_image_url: values[7] || null,
      page_count: values[8] || null,
      description: values[9] || null,
      language: values[10] || 'en',
      format: values[11] || null,
      condition: values[12] || null,
      physical_location: values[13] || null,
      date_acquired: values[14] || null,
      status: values[15] || 'unread',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.books.push(book);
    console.log(`✅ Book added: ${book.title} (ID: ${book.id})`);
    console.log(`📚 Total books in database: ${this.books.length}`);
    return [book]; // Return as array for consistency with real DB
  }

  handleInsertBookTags(query, values) {
    console.log(`🏷️ Inserting tag: ${values[1]} for book ${values[0]}`);
    const tag = {
      id: `tag_${this.nextId++}`,
      book_id: values[0],
      tag: values[1],
      created_at: new Date().toISOString()
    };

    this.bookTags.push(tag);
    return [];
  }

  handleInsertReadingProgress(query, values) {
    console.log(`📖 Inserting reading progress for book ${values[0]}`);
    const progress = {
      id: `progress_${this.nextId++}`,
      book_id: values[0],
      user_id: values[1],
      total_pages: values[2],
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.readingProgress.push(progress);
    return [];
  }
}

// Create singleton instance
const mockDb = getMockDatabase();

// Mock sql function that mimics the neon interface
const mockSql = async (template, ...values) => {
  return mockDb.query(template, values);
};

// Add transaction support (mock)
mockSql.transaction = () => ({
  begin: async () => {},
  commit: async () => {},
  rollback: async () => {},
  mockSql
});

export default mockSql;