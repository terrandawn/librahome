import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Camera,
  Edit3,
  Search,
  BookOpen,
  X,
} from "lucide-react-native";
import { useAuth } from "@/utils/auth/useAuth";

export default function AddBookScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("search"); // Default to search now
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publication_year: "",
    genre: "",
    page_count: "",
    description: "",
    format: "",
    condition: "new",
    physical_location: "",
    status: "unread",
    cover_image_url: "",
  });

  // Search books from Google Books API
  const {
    data: searchResults,
    isLoading: isSearching,
    refetch: searchBooks,
  } = useQuery({
    queryKey: ["book-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { books: [] };

      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(searchQuery.trim())}`,
      );
      if (!response.ok) throw new Error("Failed to search books");
      return response.json();
    },
    enabled: false, // Manual trigger
  });

  const createBookMutation = useMutation({
    mutationFn: async (bookData) => {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": auth?.userId || "",
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add book");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
      queryClient.invalidateQueries(["book-stats"]);

      Alert.alert("Success!", "Book added to your library successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error.message || "Failed to add book. Please try again.",
      );
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchBooks();
    }
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher,
      publication_year: book.publication_year?.toString() || "",
      genre: book.genre,
      page_count: book.page_count?.toString() || "",
      description: book.description,
      format: book.format,
      condition: book.condition || "new",
      physical_location: book.physical_location || "",
      status: book.status || "unread",
      cover_image_url: book.cover_image_url,
    });
    setActiveTab("manual"); // Switch to manual tab for editing
  };

  const handleSave = async () => {
    // No mandatory fields - save whatever the user has entered
    const bookData = {
      ...formData,
      publication_year: formData.publication_year
        ? parseInt(formData.publication_year) || null
        : null,
      page_count: formData.page_count
        ? parseInt(formData.page_count) || null
        : null,
      // Ensure we have at least something to identify the book
      title: formData.title.trim() || "Unknown Title",
    };

    createBookMutation.mutate(bookData);
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedBook(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 4 }}
          >
            <ArrowLeft color="#374151" size={24} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
            Add New Book
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={createBookMutation.isLoading}
            style={{
              backgroundColor: "#7C3AED",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              opacity: createBookMutation.isLoading ? 0.6 : 1,
            }}
          >
            {createBookMutation.isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#F3F4F6",
            borderRadius: 8,
            padding: 4,
          }}
        >
          {[
            { key: "search", label: "Search", icon: Search },
            { key: "manual", label: "Manual", icon: Edit3 },
            { key: "barcode", label: "Scan", icon: Camera },
          ].map(({ key, label, icon: Icon }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor: activeTab === key ? "#FFFFFF" : "transparent",
              }}
            >
              <Icon
                size={16}
                color={activeTab === key ? "#7C3AED" : "#6B7280"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: activeTab === key ? "#7C3AED" : "#6B7280",
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {activeTab === "search" && (
          <View style={{ gap: 16 }}>
            {/* Search Bar */}
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Search for Books
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 16,
                    color: "#111827",
                  }}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Enter title, author, or ISBN..."
                  placeholderTextColor="#9CA3AF"
                  onSubmitEditing={handleSearch}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={clearSearch}
                    style={{ padding: 8 }}
                  >
                    <X color="#9CA3AF" size={20} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  style={{
                    backgroundColor: "#7C3AED",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 8,
                    marginRight: 4,
                    opacity: !searchQuery.trim() || isSearching ? 0.6 : 1,
                  }}
                >
                  {isSearching ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                      Search
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Search Results */}
            {searchResults?.books && searchResults.books.length > 0 && (
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 12,
                  }}
                >
                  Search Results
                </Text>
                {searchResults.books.map((book, index) => (
                  <TouchableOpacity
                    key={`${book.google_id || index}`}
                    onPress={() => handleSelectBook(book)}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                      flexDirection: "row",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 60,
                        height: 80,
                        backgroundColor: "#F3F4F6",
                        borderRadius: 6,
                        marginRight: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {book.cover_image_url ? (
                        <Image
                          source={{ uri: book.cover_image_url }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <BookOpen color="#9CA3AF" size={24} />
                      )}
                    </View>
                    <View style={{ flex: 1, justifyContent: "center" }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: 4,
                        }}
                        numberOfLines={2}
                      >
                        {book.title || "Unknown Title"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6B7280",
                          marginBottom: 2,
                        }}
                        numberOfLines={1}
                      >
                        {book.author || "Unknown Author"}
                      </Text>
                      {book.publication_year && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#9CA3AF",
                          }}
                        >
                          {book.publication_year}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {searchResults?.books &&
              searchResults.books.length === 0 &&
              searchQuery && (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <BookOpen
                    color="#9CA3AF"
                    size={64}
                    style={{ marginBottom: 16 }}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 8,
                    }}
                  >
                    No Results Found
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      textAlign: "center",
                      marginBottom: 24,
                    }}
                  >
                    Try searching with a different title, author, or ISBN
                  </Text>
                  <TouchableOpacity
                    onPress={() => setActiveTab("manual")}
                    style={{
                      backgroundColor: "#7C3AED",
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                      Add Manually Instead
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        )}

        {activeTab === "manual" && (
          <View style={{ gap: 16 }}>
            {/* Show selected book info if any */}
            {selectedBook && (
              <View
                style={{
                  backgroundColor: "#EEF2FF",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#7C3AED",
                    marginBottom: 4,
                  }}
                >
                  Selected from Search Results
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#6D28D9",
                  }}
                >
                  You can edit any fields below before saving
                </Text>
              </View>
            )}

            <FormField
              label="Title"
              value={formData.title}
              onChangeText={(text) => updateFormData("title", text)}
              placeholder="Enter book title"
            />

            <FormField
              label="Author"
              value={formData.author}
              onChangeText={(text) => updateFormData("author", text)}
              placeholder="Enter author name"
            />

            <FormField
              label="ISBN"
              value={formData.isbn}
              onChangeText={(text) => updateFormData("isbn", text)}
              placeholder="Enter ISBN"
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Publisher"
                  value={formData.publisher}
                  onChangeText={(text) => updateFormData("publisher", text)}
                  placeholder="Publisher"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Year"
                  value={formData.publication_year}
                  onChangeText={(text) =>
                    updateFormData("publication_year", text)
                  }
                  placeholder="2024"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <FormField
              label="Genre"
              value={formData.genre}
              onChangeText={(text) => updateFormData("genre", text)}
              placeholder="Fiction, Non-fiction, etc."
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Pages"
                  value={formData.page_count}
                  onChangeText={(text) => updateFormData("page_count", text)}
                  placeholder="300"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Format"
                  value={formData.format}
                  onChangeText={(text) => updateFormData("format", text)}
                  placeholder="Hardcover, Paperback"
                />
              </View>
            </View>

            <FormField
              label="Description"
              value={formData.description}
              onChangeText={(text) => updateFormData("description", text)}
              placeholder="Brief description or synopsis"
              multiline
              numberOfLines={3}
            />

            <FormField
              label="Physical Location"
              value={formData.physical_location}
              onChangeText={(text) => updateFormData("physical_location", text)}
              placeholder="Bedroom shelf, Living room, etc."
            />

            {/* Status Selection */}
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Status
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {["unread", "reading", "read"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => updateFormData("status", status)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor:
                        formData.status === status ? "#7C3AED" : "#D1D5DB",
                      backgroundColor:
                        formData.status === status ? "#F3F4F6" : "#FFFFFF",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color:
                          formData.status === status ? "#7C3AED" : "#6B7280",
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Condition Selection */}
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Condition
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {["new", "like new", "used", "worn"].map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    onPress={() => updateFormData("condition", condition)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor:
                        formData.condition === condition
                          ? "#7C3AED"
                          : "#D1D5DB",
                      backgroundColor:
                        formData.condition === condition
                          ? "#F3F4F6"
                          : "#FFFFFF",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color:
                          formData.condition === condition
                            ? "#7C3AED"
                            : "#6B7280",
                      }}
                    >
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {activeTab === "barcode" && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <BookOpen color="#9CA3AF" size={64} style={{ marginBottom: 16 }} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Barcode Scanner
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              Barcode scanning will be available in a future update
            </Text>
            <TouchableOpacity
              onPress={() => setActiveTab("search")}
              style={{
                backgroundColor: "#7C3AED",
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Search for Books Instead
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function FormField({
  label,
  required = false,
  multiline = false,
  numberOfLines = 1,
  ...props
}) {
  return (
    <View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: "#374151",
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#D1D5DB",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: multiline ? 12 : 10,
          fontSize: 16,
          color: "#111827",
          textAlignVertical: multiline ? "top" : "center",
        }}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    </View>
  );
}
