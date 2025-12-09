import sql from "@/app/api/utils/sql";
import { serverLogger, logApiRequest, logApiResponse, logDbOperation } from "../utils/logger";

// GET /api/books - List all books for a user
export async function GET(request) {
  const startTime = Date.now();
  
  try {
    console.log('🔍 GET /api/books called');
    logApiRequest(request, startTime);
    
    const userId = request.headers.get("x-user-id");
    console.log('👤 User ID:', userId);

    if (!userId) {
      console.log('❌ No user ID provided');
      logApiResponse(request, 401, startTime, new Error("Unauthorized"));
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "date_added";
    const sortOrder = searchParams.get("sortOrder") || "DESC";

    let query = "SELECT * FROM books WHERE user_id = $1";
    const params = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND (LOWER(title) LIKE LOWER($${paramCount}) OR LOWER(author) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    const validSortColumns = [
      "title",
      "author",
      "date_added",
      "status",
      "updated_at",
    ];
    const sortColumn = validSortColumns.includes(sortBy)
      ? sortBy
      : "date_added";
    const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    query += ` ORDER BY ${sortColumn} ${order}`;

    const dbStartTime = Date.now();
    const books = await sql(query, params);
    logDbOperation("SELECT", "books", Date.now() - dbStartTime);

    serverLogger.info("Books retrieved successfully", { 
      count: books.length, 
      userId,
      filters: { status, search, sortBy, sortOrder }
    }, { category: "books_api" });

    logApiResponse(request, 200, startTime);
    return Response.json({ books });
  } catch (error) {
    serverLogger.error("Error fetching books", error, { 
      method: "GET",
      endpoint: "/api/books"
    });
    logApiResponse(request, 500, startTime, error);
    return Response.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

// POST /api/books - Create a new book
export async function POST(request) {
  const startTime = Date.now();
  
  try {
    logApiRequest(request, startTime);
    
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      logApiResponse(request, 401, startTime, new Error("Unauthorized"));
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      author,
      isbn,
      publisher,
      publication_year,
      genre,
      cover_image_url,
      page_count,
      description,
      language = "en",
      format,
      condition,
      physical_location,
      date_acquired,
      status = "unread",
      tags = [],
    } = body;

    if (!title) {
      logApiResponse(request, 400, startTime, new Error("Title is required"));
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    // Insert book
    const dbStartTime = Date.now();
    const [book] = await sql`
      INSERT INTO books (
        user_id, title, author, isbn, publisher, publication_year,
        genre, cover_image_url, page_count, description, language,
        format, condition, physical_location, date_acquired, status
      ) VALUES (
        ${userId}, ${title}, ${author}, ${isbn}, ${publisher}, ${publication_year},
        ${genre}, ${cover_image_url}, ${page_count}, ${description}, ${language},
        ${format}, ${condition}, ${physical_location}, ${date_acquired}, ${status}
      )
      RETURNING *
    `;
    logDbOperation("INSERT", "books", Date.now() - dbStartTime);

    // Add tags if provided
    if (tags && tags.length > 0) {
      const tagStartTime = Date.now();
      for (const tag of tags) {
        await sql`
          INSERT INTO book_tags (book_id, tag)
          VALUES (${book.id}, ${tag})
        `;
      }
      logDbOperation("INSERT", "book_tags", Date.now() - tagStartTime);
    }

    // Initialize reading progress if status is reading
    if (status === "reading" && page_count) {
      const progressStartTime = Date.now();
      await sql`
        INSERT INTO reading_progress (book_id, user_id, total_pages, started_at)
        VALUES (${book.id}, ${userId}, ${page_count}, NOW())
      `;
      logDbOperation("INSERT", "reading_progress", Date.now() - progressStartTime);
    }

    serverLogger.info("Book created successfully", { 
      bookId: book.id, 
      title: book.title,
      userId,
      status: book.status,
      tagsCount: tags.length
    }, { category: "books_api" });

    logApiResponse(request, 201, startTime);
    return Response.json({ book }, { status: 201 });
  } catch (error) {
    serverLogger.error("Error creating book", error, { 
      method: "POST",
      endpoint: "/api/books"
    });
    logApiResponse(request, 500, startTime, error);
    return Response.json({ error: "Failed to create book" }, { status: 500 });
  }
}