import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, TrendingUp, Clock, Target } from "lucide-react-native";
import { useAuth } from "@/utils/auth/useAuth";

export default function ReadingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auth } = useAuth();

  const { data: progressData, isLoading } = useQuery({
    queryKey: ["reading-progress", auth?.userId],
    queryFn: async () => {
      const response = await fetch("/api/reading-progress", {
        headers: {
          "x-user-id": auth?.userId || "",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch progress");
      return response.json();
    },
    enabled: !!auth?.userId,
  });

  const progress = progressData?.progress || [];
  const activeReading = progress.filter((p) => p.progress_percentage < 100);
  const completed = progress.filter((p) => p.progress_percentage >= 100);

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 4,
          }}
        >
          Reading Tracker
        </Text>
        <Text style={{ fontSize: 15, color: "#6B7280" }}>
          Track your reading progress
        </Text>
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : progress.length === 0 ? (
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
            No reading progress yet
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            Start reading a book to track your progress
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/library")}
            style={{
              marginTop: 24,
              backgroundColor: "#7C3AED",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}>
              Browse Library
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Currently Reading */}
          {activeReading.length > 0 && (
            <View style={{ padding: 20 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 12,
                }}
              >
                Currently Reading ({activeReading.length})
              </Text>

              {activeReading.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(`/book/${item.book_id}`)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <View style={{ flexDirection: "row", marginBottom: 12 }}>
                    <View
                      style={{
                        width: 60,
                        height: 85,
                        backgroundColor: "#F3F4F6",
                        borderRadius: 8,
                        marginRight: 12,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <BookOpen color="#9CA3AF" size={28} />
                    </View>
                    <View style={{ flex: 1, justifyContent: "center" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: 4,
                        }}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#6B7280",
                          marginBottom: 8,
                        }}
                        numberOfLines={1}
                      >
                        {item.author || "Unknown Author"}
                      </Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#7C3AED",
                            fontWeight: "600",
                          }}
                        >
                          {Math.round(item.progress_percentage)}% complete
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View
                    style={{
                      height: 6,
                      backgroundColor: "#E5E7EB",
                      borderRadius: 3,
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        width: `${Math.min(100, item.progress_percentage)}%`,
                        height: "100%",
                        backgroundColor: "#7C3AED",
                        borderRadius: 3,
                      }}
                    />
                  </View>

                  {/* Stats */}
                  <View style={{ flexDirection: "row", gap: 16 }}>
                    {item.current_page && item.total_pages && (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <BookOpen color="#6B7280" size={16} />
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#6B7280",
                            marginLeft: 6,
                          }}
                        >
                          Page {item.current_page} of {item.total_pages}
                        </Text>
                      </View>
                    )}
                    {item.target_completion_date && (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Target color="#6B7280" size={16} />
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#6B7280",
                            marginLeft: 6,
                          }}
                        >
                          Due{" "}
                          {new Date(
                            item.target_completion_date,
                          ).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <View
              style={{
                padding: 20,
                paddingTop: activeReading.length > 0 ? 0 : 20,
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
                Completed ({completed.length})
              </Text>

              {completed.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(`/book/${item.book_id}`)}
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
                      width: 50,
                      height: 70,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 6,
                      marginRight: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BookOpen color="#9CA3AF" size={24} />
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
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        marginBottom: 4,
                      }}
                      numberOfLines={1}
                    >
                      {item.author || "Unknown Author"}
                    </Text>
                    {item.completed_at && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#10B981",
                          fontWeight: "600",
                        }}
                      >
                        Completed{" "}
                        {new Date(item.completed_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
