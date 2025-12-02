import sql from "@/app/api/utils/sql";

// POST /api/reading-sessions - Create a reading session
export async function POST(request) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { book_id, start_page, end_page, start_time, end_time, notes } = body;

    if (!book_id) {
      return Response.json({ error: "book_id is required" }, { status: 400 });
    }

    // Calculate duration if both times provided
    let duration_minutes = null;
    if (start_time && end_time) {
      const start = new Date(start_time);
      const end = new Date(end_time);
      duration_minutes = Math.round((end - start) / 1000 / 60);
    }

    const [session] = await sql`
      INSERT INTO reading_sessions (
        book_id, user_id, start_page, end_page,
        start_time, end_time, duration_minutes, notes
      ) VALUES (
        ${book_id}, ${userId}, ${start_page}, ${end_page},
        ${start_time}, ${end_time}, ${duration_minutes}, ${notes}
      )
      RETURNING *
    `;

    // Update reading progress if end_page is provided
    if (end_page) {
      const [book] =
        await sql`SELECT page_count FROM books WHERE id = ${book_id}`;

      if (book && book.page_count) {
        const progress_percentage = Math.min(
          100,
          (end_page / book.page_count) * 100,
        );

        await sql`
          INSERT INTO reading_progress (book_id, user_id, current_page, total_pages, progress_percentage, updated_at)
          VALUES (${book_id}, ${userId}, ${end_page}, ${book.page_count}, ${progress_percentage}, NOW())
          ON CONFLICT (book_id, user_id) 
          DO UPDATE SET 
            current_page = ${end_page},
            progress_percentage = ${progress_percentage},
            updated_at = NOW()
        `;
      }
    }

    return Response.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Error creating reading session:", error);
    return Response.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}

// GET /api/reading-sessions - Get reading sessions
export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const book_id = searchParams.get("book_id");

    let sessions;
    if (book_id) {
      sessions = await sql`
        SELECT rs.*, b.title, b.author
        FROM reading_sessions rs
        JOIN books b ON rs.book_id = b.id
        WHERE rs.user_id = ${userId} AND rs.book_id = ${book_id}
        ORDER BY rs.created_at DESC
      `;
    } else {
      sessions = await sql`
        SELECT rs.*, b.title, b.author
        FROM reading_sessions rs
        JOIN books b ON rs.book_id = b.id
        WHERE rs.user_id = ${userId}
        ORDER BY rs.created_at DESC
        LIMIT 50
      `;
    }

    return Response.json({ sessions });
  } catch (error) {
    console.error("Error fetching reading sessions:", error);
    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  }
}
