import { runQuery, selectAll } from '../db';

// Helper functions for CRUD operations on the local SQLite DB

async function createUser(email) {
  await runQuery('INSERT INTO users (email) VALUES (?);', [email]);
  const rows = await selectAll('SELECT * FROM users WHERE email = ? LIMIT 1;', [email]);
  return rows[0] || null;
}

async function getUserById(id) {
  const rows = await selectAll('SELECT * FROM users WHERE id = ? LIMIT 1;', [id]);
  return rows[0] || null;
}

async function createBook(book) {
  // book: { user_id, title, author, isbn, publisher, publication_year, genre, cover_image_url, page_count, description, language, format, condition, physical_location, date_acquired, status }
  const cols = [];
  const placeholders = [];
  const params = [];
  for (const key of Object.keys(book)) {
    cols.push(key);
    placeholders.push('?');
    params.push(book[key]);
  }
  const sql = `INSERT INTO books (${cols.join(',')}) VALUES (${placeholders.join(',')});`;
  await runQuery(sql, params);
  // return the created book (by querying the last inserted row by unique fields)
  const rows = await selectAll('SELECT * FROM books WHERE user_id = ? AND title = ? ORDER BY created_at DESC LIMIT 1;', [book.user_id, book.title]);
  return rows[0] || null;
}

async function getBookById(id) {
  const rows = await selectAll('SELECT * FROM books WHERE id = ? LIMIT 1;', [id]);
  return rows[0] || null;
}

async function getBooksForUser(userId) {
  return await selectAll('SELECT * FROM books WHERE user_id = ? ORDER BY title ASC;', [userId]);
}

async function updateBook(id, updates = {}) {
  const sets = [];
  const params = [];
  for (const k of Object.keys(updates)) {
    sets.push(`${k} = ?`);
    params.push(updates[k]);
  }
  if (sets.length === 0) return getBookById(id);
  // update updated_at timestamp
  sets.push('updated_at = CURRENT_TIMESTAMP');
  const sql = `UPDATE books SET ${sets.join(', ')} WHERE id = ?;`;
  params.push(id);
  await runQuery(sql, params);
  return getBookById(id);
}

async function deleteBook(id) {
  await runQuery('DELETE FROM books WHERE id = ?;', [id]);
  return true;
}

async function addTag(bookId, tag) {
  await runQuery('INSERT OR IGNORE INTO book_tags (book_id, tag) VALUES (?, ?);', [bookId, tag]);
  const rows = await selectAll('SELECT * FROM book_tags WHERE book_id = ? AND tag = ? LIMIT 1;', [bookId, tag]);
  return rows[0] || null;
}

async function getTagsForBook(bookId) {
  return await selectAll('SELECT * FROM book_tags WHERE book_id = ? ORDER BY tag ASC;', [bookId]);
}

async function setReadingProgress(bookId, userId, progress = {}) {
  // progress: { current_page, total_pages, percentage_read, started_at, finished_at }
  const sql = `INSERT INTO reading_progress (book_id, user_id, current_page, total_pages, percentage_read, started_at, finished_at, last_read_at, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
               ON CONFLICT(book_id, user_id) DO UPDATE SET
                 current_page = excluded.current_page,
                 total_pages = excluded.total_pages,
                 percentage_read = excluded.percentage_read,
                 started_at = excluded.started_at,
                 finished_at = excluded.finished_at,
                 last_read_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP;`;
  const params = [bookId, userId, progress.current_page || 0, progress.total_pages || null, progress.percentage_read || 0, progress.started_at || null, progress.finished_at || null];
  await runQuery(sql, params);
  const rows = await selectAll('SELECT * FROM reading_progress WHERE book_id = ? AND user_id = ? LIMIT 1;', [bookId, userId]);
  return rows[0] || null;
}

async function getReadingProgress(bookId, userId) {
  const rows = await selectAll('SELECT * FROM reading_progress WHERE book_id = ? AND user_id = ? LIMIT 1;', [bookId, userId]);
  return rows[0] || null;
}

async function addReadingSession(session = {}) {
  // session: { book_id, user_id, start_page, end_page, pages_read, duration_minutes, session_date, notes }
  const cols = [];
  const placeholders = [];
  const params = [];
  for (const key of Object.keys(session)) {
    cols.push(key);
    placeholders.push('?');
    params.push(session[key]);
  }
  const sql = `INSERT INTO reading_sessions (${cols.join(',')}) VALUES (${placeholders.join(',')});`;
  await runQuery(sql, params);
  const rows = await selectAll('SELECT * FROM reading_sessions WHERE book_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1;', [session.book_id, session.user_id]);
  return rows[0] || null;
}

async function getReadingSessions(bookId, userId) {
  return await selectAll('SELECT * FROM reading_sessions WHERE book_id = ? AND user_id = ? ORDER BY session_date DESC;', [bookId, userId]);
}

export default {
  createUser,
  getUserById,
  createBook,
  getBookById,
  getBooksForUser,
  updateBook,
  deleteBook,
  addTag,
  getTagsForBook,
  setReadingProgress,
  getReadingProgress,
  addReadingSession,
  getReadingSessions,
};
