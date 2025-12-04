/**
 * Book Management Utility with Comprehensive Logging
 * Handles all book-related operations with detailed logging
 */

import { actionLogger } from './actionLogger';

export class BookManager {
  constructor() {
    this.books = [];
    this.loadBooks();
  }

  // Load books from storage with logging
  async loadBooks() {
    try {
      actionLogger.logPerformance('book_load_start', Date.now());
      
      // In a real app, this would load from AsyncStorage or API
      // For now, we'll simulate with empty array
      this.books = [];
      
      actionLogger.logPerformance('book_load_complete', Date.now());
      actionLogger.info('Books loaded from storage', { count: this.books.length });
    } catch (error) {
      actionLogger.logError(error, { action: 'load_books' });
      throw error;
    }
  }

  // Add a new book with comprehensive logging
  async addBook(bookData) {
    const startTime = Date.now();
    
    try {
      // Validate book data
      this.validateBookData(bookData);
      
      const newBook = {
        id: this.generateBookId(),
        ...bookData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.books.push(newBook);
      
      await this.saveBooks();
      
      const duration = Date.now() - startTime;
      actionLogger.logBookAction('added', newBook.id, newBook.title, { duration });
      actionLogger.logPerformance('book_add_duration', duration);
      
      return newBook;
    } catch (error) {
      const duration = Date.now() - startTime;
      actionLogger.logError(error, { 
        action: 'add_book', 
        bookData: sanitizeBookData(bookData),
        duration 
      });
      throw error;
    }
  }

  // Update an existing book with logging
  async updateBook(bookId, updateData) {
    const startTime = Date.now();
    
    try {
      const bookIndex = this.books.findIndex(book => book.id === bookId);
      
      if (bookIndex === -1) {
        throw new Error(`Book with ID ${bookId} not found`);
      }

      const oldBook = { ...this.books[bookIndex] };
      const updatedBook = {
        ...this.books[bookIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      this.books[bookIndex] = updatedBook;
      await this.saveBooks();
      
      const duration = Date.now() - startTime;
      actionLogger.logBookAction('updated', bookId, updatedBook.title, { 
        duration,
        changes: getBookChanges(oldBook, updatedBook)
      });
      
      return updatedBook;
    } catch (error) {
      const duration = Date.now() - startTime;
      actionLogger.logError(error, { 
        action: 'update_book', 
        bookId,
        updateData: sanitizeBookData(updateData),
        duration 
      });
      throw error;
    }
  }

  // Delete a book with logging
  async deleteBook(bookId) {
    const startTime = Date.now();
    
    try {
      const bookIndex = this.books.findIndex(book => book.id === bookId);
      
      if (bookIndex === -1) {
        throw new Error(`Book with ID ${bookId} not found`);
      }

      const deletedBook = this.books[bookIndex];
      this.books.splice(bookIndex, 1);
      
      await this.saveBooks();
      
      const duration = Date.now() - startTime;
      actionLogger.logBookAction('deleted', bookId, deletedBook.title, { duration });
      
      return deletedBook;
    } catch (error) {
      const duration = Date.now() - startTime;
      actionLogger.logError(error, { 
        action: 'delete_book', 
        bookId,
        duration 
      });
      throw error;
    }
  }

  // Search books with logging
  searchBooks(query, filters = {}) {
    try {
      actionLogger.logBookSearch(query, 0, filters);
      
      let results = this.books;
      
      // Text search
      if (query) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(book => 
          book.title?.toLowerCase().includes(lowerQuery) ||
          book.author?.toLowerCase().includes(lowerQuery) ||
          book.isbn?.includes(query) ||
          book.description?.toLowerCase().includes(lowerQuery)
        );
      }
      
      // Apply filters
      if (filters.genre) {
        results = results.filter(book => book.genre === filters.genre);
      }
      
      if (filters.author) {
        results = results.filter(book => 
          book.author?.toLowerCase().includes(filters.author.toLowerCase())
        );
      }
      
      if (filters.year) {
        results = results.filter(book => 
          book.publishedYear?.toString() === filters.year.toString()
        );
      }
      
      if (filters.status) {
        results = results.filter(book => book.status === filters.status);
      }
      
      actionLogger.logBookSearch(query, results.length, filters);
      
      return results;
    } catch (error) {
      actionLogger.logError(error, { 
        action: 'search_books', 
        query,
        filters 
      });
      throw error;
    }
  }

  // Get book by ID with logging
  getBookById(bookId) {
    try {
      const book = this.books.find(b => b.id === bookId);
      
      if (!book) {
        actionLogger.logBookAction('not_found', bookId);
        return null;
      }
      
      actionLogger.logBookAction('viewed', bookId, book.title);
      
      return book;
    } catch (error) {
      actionLogger.logError(error, { 
        action: 'get_book_by_id', 
        bookId 
      });
      throw error;
    }
  }

  // Get all books with optional pagination
  getAllBooks(page = 1, limit = 50) {
    try {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBooks = this.books.slice(startIndex, endIndex);
      
      actionLogger.info('Books retrieved', {
        page,
        limit,
        totalBooks: this.books.length,
        returnedBooks: paginatedBooks.length
      }, { category: 'book_management' });
      
      return {
        books: paginatedBooks,
        pagination: {
          page,
          limit,
          total: this.books.length,
          totalPages: Math.ceil(this.books.length / limit)
        }
      };
    } catch (error) {
      actionLogger.logError(error, { 
        action: 'get_all_books', 
        page,
        limit 
      });
      throw error;
    }
  }

  // Mark book as read/unread with logging
  async markBookAsRead(bookId, isRead = true) {
    try {
      return await this.updateBook(bookId, { 
        status: isRead ? 'read' : 'unread',
        readDate: isRead ? new Date().toISOString() : null
      });
    } catch (error) {
      actionLogger.logError(error, { 
        action: 'mark_book_read', 
        bookId,
        isRead 
      });
      throw error;
    }
  }

  // Add reading progress with logging
  async updateReadingProgress(bookId, progress) {
    try {
      return await this.updateBook(bookId, { 
        readingProgress: Math.min(100, Math.max(0, progress)),
        lastReadDate: new Date().toISOString()
      });
    } catch (error) {
      actionLogger.logError(error, { 
        action: 'update_reading_progress', 
        bookId,
        progress 
      });
      throw error;
    }
  }

  // Private helper methods
  validateBookData(bookData) {
    const required = ['title', 'author'];
    const missing = required.filter(field => !bookData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    if (bookData.isbn && !this.isValidISBN(bookData.isbn)) {
      throw new Error('Invalid ISBN format');
    }
  }

  isValidISBN(isbn) {
    // Simple ISBN validation (basic format check)
    const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;
    return isbnRegex.test(isbn);
  }

  generateBookId() {
    return `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async saveBooks() {
    try {
      // In a real app, this would save to AsyncStorage or API
      actionLogger.info('Books saved to storage', { count: this.books.length });
    } catch (error) {
      actionLogger.logError(error, { action: 'save_books' });
      throw error;
    }
  }
}

// Helper functions for logging
const sanitizeBookData = (bookData) => {
  if (!bookData) return {};
  
  const sanitized = { ...bookData };
  
  // Remove or redact sensitive fields if any
  // For books, there usually aren't sensitive fields, but this is a good practice
  
  return sanitized;
};

const getBookChanges = (oldBook, newBook) => {
  const changes = {};
  
  Object.keys(newBook).forEach(key => {
    if (oldBook[key] !== newBook[key] && key !== 'updatedAt') {
      changes[key] = {
        old: oldBook[key],
        new: newBook[key]
      };
    }
  });
  
  return changes;
};

// Export singleton instance
export const bookManager = new BookManager();
export default bookManager;