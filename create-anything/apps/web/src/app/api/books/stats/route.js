import sql from "@/app/api/utils/sql";

// GET /api/books/stats - Get library statistics
export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total counts by status
    const statusCounts = await sql`
      SELECT status, COUNT(*) as count
      FROM books
      WHERE user_id = ${userId}
      GROUP BY status
    `;

    // Get total books
    const [totalResult] = await sql`
      SELECT COUNT(*) as total FROM books WHERE user_id = ${userId}
    `;

    // Get currently reading books
    const currentlyReading = await sql`
      SELECT b.*, rp.progress_percentage, rp.current_page
      FROM books b
      LEFT JOIN reading_progress rp ON b.id = rp.book_id
      WHERE b.user_id = ${userId} AND b.status = 'reading'
      ORDER BY rp.updated_at DESC
      LIMIT 5
    `;

    // Get recent additions
    const recentBooks = await sql`
      SELECT * FROM books
      WHERE user_id = ${userId}
      ORDER BY date_added DESC
      LIMIT 5
    `;

    // Get favorite books
    const favoriteBooks = await sql`
      SELECT * FROM books
      WHERE user_id = ${userId} AND is_favorite = true
      ORDER BY updated_at DESC
      LIMIT 5
    `;

    // Get top genres
    const topGenres = await sql`
      SELECT genre, COUNT(*) as count
      FROM books
      WHERE user_id = ${userId} AND genre IS NOT NULL
      GROUP BY genre
      ORDER BY count DESC
      LIMIT 5
    `;

    // Get top authors
    const topAuthors = await sql`
      SELECT author, COUNT(*) as count
      FROM books
      WHERE user_id = ${userId} AND author IS NOT NULL
      GROUP BY author
      ORDER BY count DESC
      LIMIT 5
    `;

    // Format status counts
    const stats = {
      total: parseInt(totalResult.total),
      byStatus: {},
      currentlyReading,
      recentBooks,
      favoriteBooks,
      topGenres,
      topAuthors,
    };

    statusCounts.forEach(({ status, count }) => {
      stats.byStatus[status] = parseInt(count);
    });

    // Ensure all statuses have a count
    const allStatuses = [
      "new",
      "read",
      "unread",
      "reading",
      "sold",
      "lent",
      "borrowed",
    ];
    allStatuses.forEach((status) => {
      if (!stats.byStatus[status]) {
        stats.byStatus[status] = 0;
      }
    });

    return Response.json({ stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
