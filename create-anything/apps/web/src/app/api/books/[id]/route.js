import sql from "@/app/api/utils/sql";

// GET /api/books/[id] - Get a single book with tags and progress
export async function GET(request, { params }) {
  try {
    const userId = request.headers.get("x-user-id");
    const { id } = params;

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [book] = await sql`
      SELECT * FROM books 
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    // Get tags
    const tags = await sql`
      SELECT tag FROM book_tags WHERE book_id = ${id}
    `;

    // Get reading progress
    const [progress] = await sql`
      SELECT * FROM reading_progress 
      WHERE book_id = ${id} AND user_id = ${userId}
    `;

    return Response.json({
      book: {
        ...book,
        tags: tags.map((t) => t.tag),
        progress,
      },
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    return Response.json({ error: "Failed to fetch book" }, { status: 500 });
  }
}

// PATCH /api/books/[id] - Update a book
export async function PATCH(request, { params }) {
  try {
    const userId = request.headers.get("x-user-id");
    const { id } = params;

    if (!userId) {
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
      language,
      format,
      condition,
      physical_location,
      date_acquired,
      status,
      is_favorite,
      tags,
    } = body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (title !== undefined) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      values.push(title);
    }
    if (author !== undefined) {
      paramCount++;
      updates.push(`author = $${paramCount}`);
      values.push(author);
    }
    if (isbn !== undefined) {
      paramCount++;
      updates.push(`isbn = $${paramCount}`);
      values.push(isbn);
    }
    if (publisher !== undefined) {
      paramCount++;
      updates.push(`publisher = $${paramCount}`);
      values.push(publisher);
    }
    if (publication_year !== undefined) {
      paramCount++;
      updates.push(`publication_year = $${paramCount}`);
      values.push(publication_year);
    }
    if (genre !== undefined) {
      paramCount++;
      updates.push(`genre = $${paramCount}`);
      values.push(genre);
    }
    if (cover_image_url !== undefined) {
      paramCount++;
      updates.push(`cover_image_url = $${paramCount}`);
      values.push(cover_image_url);
    }
    if (page_count !== undefined) {
      paramCount++;
      updates.push(`page_count = $${paramCount}`);
      values.push(page_count);
    }
    if (description !== undefined) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      values.push(description);
    }
    if (language !== undefined) {
      paramCount++;
      updates.push(`language = $${paramCount}`);
      values.push(language);
    }
    if (format !== undefined) {
      paramCount++;
      updates.push(`format = $${paramCount}`);
      values.push(format);
    }
    if (condition !== undefined) {
      paramCount++;
      updates.push(`condition = $${paramCount}`);
      values.push(condition);
    }
    if (physical_location !== undefined) {
      paramCount++;
      updates.push(`physical_location = $${paramCount}`);
      values.push(physical_location);
    }
    if (date_acquired !== undefined) {
      paramCount++;
      updates.push(`date_acquired = $${paramCount}`);
      values.push(date_acquired);
    }
    if (status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      values.push(status);
    }
    if (is_favorite !== undefined) {
      paramCount++;
      updates.push(`is_favorite = $${paramCount}`);
      values.push(is_favorite);
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    paramCount++;
    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date());

    paramCount++;
    values.push(id);
    paramCount++;
    values.push(userId);

    const query = `
      UPDATE books 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
      RETURNING *
    `;

    const [book] = await sql(query, values);

    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    // Update tags if provided
    if (tags !== undefined) {
      await sql`DELETE FROM book_tags WHERE book_id = ${id}`;

      if (tags.length > 0) {
        for (const tag of tags) {
          await sql`
            INSERT INTO book_tags (book_id, tag)
            VALUES (${id}, ${tag})
          `;
        }
      }
    }

    return Response.json({ book });
  } catch (error) {
    console.error("Error updating book:", error);
    return Response.json({ error: "Failed to update book" }, { status: 500 });
  }
}

// DELETE /api/books/[id] - Delete a book
export async function DELETE(request, { params }) {
  try {
    const userId = request.headers.get("x-user-id");
    const { id } = params;

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [deleted] = await sql`
      DELETE FROM books 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;

    if (!deleted) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting book:", error);
    return Response.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
