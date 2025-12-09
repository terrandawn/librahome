import sql from "@/app/api/utils/sql";

// POST /api/reading-progress - Update reading progress
export async function POST(request) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { book_id, current_page, total_pages, target_completion_date } = body;

    if (!book_id) {
      return Response.json({ error: "book_id is required" }, { status: 400 });
    }

    // Calculate progress percentage
    const progress_percentage =
      total_pages && current_page
        ? Math.min(100, (current_page / total_pages) * 100)
        : 0;

    // Check if progress exists
    const [existing] = await sql`
      SELECT * FROM reading_progress 
      WHERE book_id = ${book_id} AND user_id = ${userId}
    `;

    let progress;

    if (existing) {
      // Update existing progress
      const updates = [];
      const values = [];
      let paramCount = 0;

      if (current_page !== undefined) {
        paramCount++;
        updates.push(`current_page = $${paramCount}`);
        values.push(current_page);
      }
      if (total_pages !== undefined) {
        paramCount++;
        updates.push(`total_pages = $${paramCount}`);
        values.push(total_pages);
      }
      if (progress_percentage !== undefined) {
        paramCount++;
        updates.push(`progress_percentage = $${paramCount}`);
        values.push(progress_percentage);
      }
      if (target_completion_date !== undefined) {
        paramCount++;
        updates.push(`target_completion_date = $${paramCount}`);
        values.push(target_completion_date);
      }

      // Check if completed
      if (progress_percentage >= 100 && !existing.completed_at) {
        paramCount++;
        updates.push(`completed_at = $${paramCount}`);
        values.push(new Date());
      }

      paramCount++;
      updates.push(`updated_at = $${paramCount}`);
      values.push(new Date());

      paramCount++;
      values.push(book_id);
      paramCount++;
      values.push(userId);

      const query = `
        UPDATE reading_progress 
        SET ${updates.join(", ")}
        WHERE book_id = $${paramCount - 1} AND user_id = $${paramCount}
        RETURNING *
      `;

      [progress] = await sql(query, values);

      // Update book status if completed
      if (progress_percentage >= 100) {
        await sql`
          UPDATE books 
          SET status = 'read', updated_at = NOW()
          WHERE id = ${book_id} AND user_id = ${userId}
        `;
      }
    } else {
      // Create new progress
      [progress] = await sql`
        INSERT INTO reading_progress (
          book_id, user_id, current_page, total_pages, 
          progress_percentage, target_completion_date, started_at
        ) VALUES (
          ${book_id}, ${userId}, ${current_page || 0}, ${total_pages},
          ${progress_percentage}, ${target_completion_date}, NOW()
        )
        RETURNING *
      `;

      // Update book status to reading
      await sql`
        UPDATE books 
        SET status = 'reading', updated_at = NOW()
        WHERE id = ${book_id} AND user_id = ${userId}
      `;
    }

    return Response.json({ progress });
  } catch (error) {
    console.error("Error updating reading progress:", error);
    return Response.json(
      { error: "Failed to update progress" },
      { status: 500 },
    );
  }
}

// GET /api/reading-progress - Get all reading progress
export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const progress = await sql`
      SELECT rp.*, b.title, b.author, b.cover_image_url
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      WHERE rp.user_id = ${userId}
      ORDER BY rp.updated_at DESC
    `;

    return Response.json({ progress });
  } catch (error) {
    console.error("Error fetching reading progress:", error);
    return Response.json(
      { error: "Failed to fetch progress" },
      { status: 500 },
    );
  }
}
