import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  BookOpen,
  Calendar,
  MapPin,
  User,
  Hash,
  Building,
  Star,
  Heart,
  Play,
  Pause,
  BarChart3,
} from "lucide-react-native";
import { useAuth } from "@/utils/auth/useAuth";

export default function BookDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const {
    data: bookData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["book", id],
    queryFn: async () => {
      const response = await fetch(`/api/books/${id}`, {
        headers: {
          "x-user-id": auth?.userId || "",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch book");
      return response.json();
    },
    enabled: !!auth?.userId && !!id,
  });

  const updateBookMutation = useMutation({
    mutationFn: async (bookData) => {
      const response = await fetch(`/api/books/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": auth?.userId || "",
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update book");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["book", id]);
      queryClient.invalidateQueries(["books"]);
      queryClient.invalidateQueries(["book-stats"]);
      setIsEditing(false);
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/books/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": auth?.userId || "",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete book");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
      queryClient.invalidateQueries(["book-stats"]);
      router.back();
    },
  });

  const book = bookData?.book;

  useEffect(() => {
    if (book && !isEditing) {
      setEditFormData({
        title: book.title || "",
        author: book.author || "",
        isbn: book.isbn || "",
        publisher: book.publisher || "",
        publication_year: book.publication_year?.toString() || "",
        genre: book.genre || "",
        page_count: book.page_count?.toString() || "",
        description: book.description || "",
        format: book.format || "",
        condition: book.condition || "",
        physical_location: book.physical_location || "",
        status: book.status || "unread",
        is_favorite: book.is_favorite || false,
      });
    }
  }, [book, isEditing]);

  const handleSave = () => {
    const updateData = {
      ...editFormData,
      publication_year: editFormData.publication_year
        ? parseInt(editFormData.publication_year)
        : null,
      page_count: editFormData.page_count
        ? parseInt(editFormData.page_count)
        : null,
    };
    updateBookMutation.mutate(updateData);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Book",
      `Are you sure you want to delete "${book?.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteBookMutation.mutate(),
        },
      ],
    );
  };

  const toggleFavorite = () => {
    updateBookMutation.mutate({ is_favorite: !book.is_favorite });
  };

  const updateStatus = (newStatus) => {
    updateBookMutation.mutate({ status: newStatus });
  };

  const startReading = () => {
    // Navigate to reading tracker or update status to reading
    updateStatus("reading");
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
        }}
      >
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>
          Loading book details...
        </Text>
      </View>
    );
  }

  if (error || !book) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#EF4444",
            marginBottom: 8,
          }}
        >
          Book Not Found
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          The book you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "#7C3AED",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#111827",
              flex: 1,
              textAlign: "center",
            }}
          >
            Book Details
          </Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity onPress={toggleFavorite} style={{ padding: 4 }}>
              <Heart
                color={book.is_favorite ? "#EF4444" : "#9CA3AF"}
                size={22}
                fill={book.is_favorite ? "#EF4444" : "transparent"}
              />
            </TouchableOpacity>

            {isEditing ? (
              <TouchableOpacity
                onPress={handleSave}
                disabled={updateBookMutation.isLoading}
                style={{
                  backgroundColor: "#7C3AED",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  opacity: updateBookMutation.isLoading ? 0.6 : 1,
                }}
              >
                {updateBookMutation.isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={{ padding: 4 }}
              >
                <Edit3 color="#6B7280" size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Book Cover and Basic Info */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 20,
            paddingVertical: 24,
          }}
        >
          <View style={{ flexDirection: "row", gap: 16 }}>
            {/* Book Cover */}
            <View
              style={{
                width: 120,
                height: 180,
                backgroundColor: "#F3F4F6",
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#E5E7EB",
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
                <BookOpen color="#9CA3AF" size={48} />
              )}
            </View>

            {/* Basic Info */}
            <View style={{ flex: 1 }}>
              {isEditing ? (
                <TextInput
                  value={editFormData.title}
                  onChangeText={(text) =>
                    setEditFormData((prev) => ({ ...prev, title: text }))
                  }
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    backgroundColor: "#FFFFFF",
                  }}
                />
              ) : (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: 8,
                  }}
                >
                  {book.title}
                </Text>
              )}

              {isEditing ? (
                <TextInput
                  value={editFormData.author}
                  onChangeText={(text) =>
                    setEditFormData((prev) => ({ ...prev, author: text }))
                  }
                  placeholder="Author"
                  style={{
                    fontSize: 16,
                    color: "#6B7280",
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    backgroundColor: "#FFFFFF",
                  }}
                />
              ) : (
                <Text
                  style={{ fontSize: 16, color: "#6B7280", marginBottom: 12 }}
                >
                  {book.author || "Unknown Author"}
                </Text>
              )}

              {/* Status Badge */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: getStatusColor(book.status).bg,
                    borderRadius: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: getStatusColor(book.status).text,
                    }}
                  >
                    {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                  </Text>
                </View>

                {book.is_favorite && (
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: "#FEE2E2",
                      borderRadius: 16,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "#991B1B",
                      }}
                    >
                      Favorite
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {book.status === "unread" && (
                  <TouchableOpacity
                    onPress={startReading}
                    style={{
                      backgroundColor: "#7C3AED",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <Play
                      color="#FFFFFF"
                      size={16}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      Start Reading
                    </Text>
                  </TouchableOpacity>
                )}

                {book.status === "reading" && (
                  <TouchableOpacity
                    onPress={() => router.push(`/reading-progress/${book.id}`)}
                    style={{
                      backgroundColor: "#10B981",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <BarChart3
                      color="#FFFFFF"
                      size={16}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      Track Progress
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Detailed Information */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            marginTop: 8,
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Book Information
          </Text>

          <View style={{ gap: 12 }}>
            <InfoRow
              icon={Hash}
              label="ISBN"
              value={book.isbn}
              isEditing={isEditing}
              editValue={editFormData.isbn}
              onEdit={(text) =>
                setEditFormData((prev) => ({ ...prev, isbn: text }))
              }
            />

            <InfoRow
              icon={Building}
              label="Publisher"
              value={book.publisher}
              isEditing={isEditing}
              editValue={editFormData.publisher}
              onEdit={(text) =>
                setEditFormData((prev) => ({ ...prev, publisher: text }))
              }
            />

            <InfoRow
              icon={Calendar}
              label="Year"
              value={book.publication_year?.toString()}
              isEditing={isEditing}
              editValue={editFormData.publication_year}
              onEdit={(text) =>
                setEditFormData((prev) => ({ ...prev, publication_year: text }))
              }
            />

            <InfoRow
              icon={BookOpen}
              label="Genre"
              value={book.genre}
              isEditing={isEditing}
              editValue={editFormData.genre}
              onEdit={(text) =>
                setEditFormData((prev) => ({ ...prev, genre: text }))
              }
            />

            <InfoRow
              icon={BookOpen}
              label="Pages"
              value={book.page_count?.toString()}
              isEditing={isEditing}
              editValue={editFormData.page_count}
              onEdit={(text) =>
                setEditFormData((prev) => ({ ...prev, page_count: text }))
              }
            />

            <InfoRow
              icon={MapPin}
              label="Location"
              value={book.physical_location}
              isEditing={isEditing}
              editValue={editFormData.physical_location}
              onEdit={(text) =>
                setEditFormData((prev) => ({
                  ...prev,
                  physical_location: text,
                }))
              }
            />
          </View>
        </View>

        {/* Description */}
        {(book.description || isEditing) && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              marginTop: 8,
              paddingHorizontal: 20,
              paddingVertical: 20,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 12,
              }}
            >
              Description
            </Text>

            {isEditing ? (
              <TextInput
                value={editFormData.description}
                onChangeText={(text) =>
                  setEditFormData((prev) => ({ ...prev, description: text }))
                }
                placeholder="Enter description..."
                multiline
                numberOfLines={4}
                style={{
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 20,
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: "#FFFFFF",
                  textAlignVertical: "top",
                }}
              />
            ) : (
              <Text style={{ fontSize: 14, color: "#374151", lineHeight: 20 }}>
                {book.description}
              </Text>
            )}
          </View>
        )}

        {/* Reading Progress */}
        {book.progress && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              marginTop: 8,
              paddingHorizontal: 20,
              paddingVertical: 20,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 12,
              }}
            >
              Reading Progress
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 8,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 4,
                  marginRight: 12,
                }}
              >
                <View
                  style={{
                    width: `${Math.min(100, book.progress.progress_percentage || 0)}%`,
                    height: "100%",
                    backgroundColor: "#7C3AED",
                    borderRadius: 4,
                  }}
                />
              </View>
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}
              >
                {Math.round(book.progress.progress_percentage || 0)}%
              </Text>
            </View>

            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              Page {book.progress.current_page || 0} of{" "}
              {book.progress.total_pages || book.page_count || "?"}
            </Text>
          </View>
        )}

        {/* Danger Zone */}
        {isEditing && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              marginTop: 8,
              paddingHorizontal: 20,
              paddingVertical: 20,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: "#EF4444",
                marginBottom: 12,
              }}
            >
              Danger Zone
            </Text>

            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleteBookMutation.isLoading}
              style={{
                backgroundColor: "#FEE2E2",
                borderWidth: 1,
                borderColor: "#EF4444",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: deleteBookMutation.isLoading ? 0.6 : 1,
              }}
            >
              {deleteBookMutation.isLoading ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Trash2
                    color="#EF4444"
                    size={16}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: "#EF4444", fontWeight: "600" }}>
                    Delete Book
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon: Icon, label, value, isEditing, editValue, onEdit }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Icon color="#6B7280" size={16} />
      <Text
        style={{ fontSize: 14, fontWeight: "500", color: "#6B7280", width: 80 }}
      >
        {label}
      </Text>
      <View style={{ flex: 1 }}>
        {isEditing ? (
          <TextInput
            value={editValue || ""}
            onChangeText={onEdit}
            placeholder={`Enter ${label.toLowerCase()}`}
            style={{
              fontSize: 14,
              color: "#111827",
              borderWidth: 1,
              borderColor: "#D1D5DB",
              borderRadius: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: "#FFFFFF",
            }}
          />
        ) : (
          <Text style={{ fontSize: 14, color: "#111827" }}>{value || "-"}</Text>
        )}
      </View>
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
