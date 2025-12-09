import { neon } from '@neondatabase/serverless';
import mockSql from './mock-db.js';

const NullishQueryFunction = () => {
  console.warn('⚠️  No DATABASE_URL provided. Using mock database for development.');
  console.warn('📝 Books will be stored in memory only and will be lost on server restart.');
  console.warn('🔧 To set up a real database, copy .env.example to .env and configure DATABASE_URL');
  return mockSql;
};

NullishQueryFunction.transaction = () => ({
  begin: async () => {},
  commit: async () => {},
  rollback: async () => {},
  query: mockSql
});

// Try to use real database, fall back to mock if not available
let sql;
try {
  if (process.env.DATABASE_URL) {
    sql = neon(process.env.DATABASE_URL);
    console.log('✅ Connected to Neon database');
  } else {
    sql = NullishQueryFunction();
  }
} catch (error) {
  console.warn('⚠️  Failed to connect to database:', error.message);
  sql = NullishQueryFunction();
}

export default sql;