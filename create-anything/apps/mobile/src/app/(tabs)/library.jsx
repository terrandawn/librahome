import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Plus,
} from "lucide-react-native";
import { useAuth } from "@/utils/auth/useAuth";

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auth } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: booksData, isLoading } = useQuery({
    queryKey: ["books", auth?.userId, filterStatus, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/books?${params}`, {
        headers: {
          "x-user-id": auth?.userId || "",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch books");
      return response.json();
    },
    enabled: !!auth?.userId,
  });

  const books = booksData?.books || [];

  const statusFilters = [
    { label: "All", value: "all" },
    { label: "Reading", value: "reading" },
    { label: "Unread", value: "unread" },
    { label: "Read", value: "read" },
    { label: "Lent", value: "lent" },
  ];

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
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#111827" }}>
            Library
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#F3F4F6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {viewMode === "grid" ? (
                <List color="#374151" size={20} />
              ) : (
                <Grid color="#374151" size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F3F4F6",
            borderRadius: 12,
            paddingHorizontal: 12,
            height: 44,
          }}
        >
          <Search color="#9CA3AF" size={20} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search books..."
            placeholderTextColor="#9CA3AF"
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 15,
              color: "#111827",
            }}
          />
        </View>
      </View>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 8,
        }}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            onPress={() => setFilterStatus(filter.value)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor:
                filterStatus === filter.value ? "#7C3AED" : "#F3F4F6",
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: filterStatus === filter.value ? "#FFFFFF" : "#6B7280",
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Books List */}
      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : books.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 40,
          }}
        >
          <BookOpen color="#D1D5DB" size={64} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#374151",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            No books found
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {searchQuery
              ? "Try a different search term"
              : "Add your first book to get started"}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              onPress={() => router.push("/add-book")}
              style={{
                marginTop: 24,
                backgroundColor: "#7C3AED",
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}
              >
                Add Book
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {viewMode === "grid" ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {books.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  onPress={() => router.push(`/book/${book.id}`)}
                  style={{
                    width: "48%",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      height: 180,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 8,
                      marginBottom: 8,
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
                      <BookOpen color="#9CA3AF" size={40} />
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 4,
                    }}
                    numberOfLines={2}
                  >
                    {book.title}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}
                    numberOfLines={1}
                  >
                    {book.author || "Unknown"}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      backgroundColor: getStatusColor(book.status).bg,
                      borderRadius: 4,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: getStatusColor(book.status).text,
                      }}
                    >
                      {book.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {books.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  onPress={() => router.push(`/book/${book.id}`)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 12,
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
                      height: 85,
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
                      <BookOpen color="#9CA3AF" size={28} />
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
                      numberOfLines={1}
                    >
                      {book.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        marginBottom: 6,
                      }}
                      numberOfLines={1}
                    >
                      {book.author || "Unknown Author"}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          backgroundColor: getStatusColor(book.status).bg,
                          borderRadius: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: getStatusColor(book.status).text,
                          }}
                        >
                          {book.status}
                        </Text>
                      </View>
                      {book.genre && (
                        <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                          {book.genre}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => router.push("/add-book")}
        style={{
          position: "absolute",
          right: 20,
          bottom: insets.bottom + 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#7C3AED",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#7C3AED",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Plus color="#FFFFFF" size={28} />
      </TouchableOpacity>
    </View>
  );
}

function getStatusColor(status) {
  const colors = {
    read: { bg: "#D1FAE5", text: "#065F46" },
    reading: { bg: "#FEF3C7", text: "#92400E" },
    unread: { bg: "#E5E7EB", text: "#374151" },
    lent: { bg: "#DBEAFE", text: "#1E40AF" },
    borrowed: { bg: "#EDE9FE", text: "#5B21B6" },
    new: { bg: "#FCE7F3", text: "#9F1239" },
    sold: { bg: "#FEE2E2", text: "#991B1B" },
  };
  return colors[status] || colors.unread;
}
