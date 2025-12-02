export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return Response.json(
        { error: "Search query is required" },
        { status: 400 },
      );
    }

    // Search Google Books API
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;

    const response = await fetch(googleBooksUrl);

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform Google Books response to our format
    const books = (data.items || []).map((item) => {
      const volumeInfo = item.volumeInfo;
      const industryIdentifiers = volumeInfo.industryIdentifiers || [];

      // Try to find ISBN-13 first, then ISBN-10
      const isbn13 = industryIdentifiers.find((id) => id.type === "ISBN_13");
      const isbn10 = industryIdentifiers.find((id) => id.type === "ISBN_10");
      const isbn = isbn13?.identifier || isbn10?.identifier || "";

      return {
        google_id: item.id,
        title: volumeInfo.title || "",
        author: volumeInfo.authors?.join(", ") || "",
        isbn: isbn,
        publisher: volumeInfo.publisher || "",
        publication_year: volumeInfo.publishedDate
          ? parseInt(volumeInfo.publishedDate.split("-")[0]) || null
          : null,
        page_count: volumeInfo.pageCount || null,
        description: volumeInfo.description || "",
        genre: volumeInfo.categories?.join(", ") || "",
        cover_image_url:
          volumeInfo.imageLinks?.thumbnail ||
          volumeInfo.imageLinks?.smallThumbnail ||
          "",
        language: volumeInfo.language || "en",
        format: volumeInfo.printType || "",
        // Default values for our additional fields
        condition: "new",
        physical_location: "",
        status: "unread",
        is_favorite: false,
      };
    });

    return Response.json({ books });
  } catch (error) {
    console.error("Google Books search error:", error);
    return Response.json(
      { error: "Failed to search books. Please try again." },
      { status: 500 },
    );
  }
}
