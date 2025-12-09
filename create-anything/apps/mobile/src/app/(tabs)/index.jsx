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
import { BookOpen, Plus, TrendingUp, Heart, Clock } from "lucide-react-native";
import { useAuth } from "@/utils/auth/useAuth";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auth, isReady, signIn } = useAuth();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["book-stats", auth?.userId],
    queryFn: async () => {
      const response = await fetch("/api/books/stats", {
        headers: {
          "x-user-id": auth?.userId || "",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    enabled: !!auth?.userId,
  });

  // Show loading while auth is being initialized
  if (!isReady) {
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
        <Text style={{ marginTop: 12, color: "#6B7280" }}>Loading...</Text>
      </View>
    );
  }

  // Show sign in prompt if not authenticated
  if (!auth) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Welcome to LibraHome
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Sign in to manage your personal library
        </Text>
        <TouchableOpacity
          onPress={signIn}
          style={{
            backgroundColor: "#7C3AED",
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 12,
            shadowColor: "#7C3AED",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats = statsData?.stats;

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
          LibraHome
        </Text>
        <Text style={{ fontSize: 15, color: "#6B7280" }}>
          Your personal library
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        {isLoading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : (
          <>
            <View style={{ padding: 20 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 12,
                }}
              >
                Library Overview
              </Text>

              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <View style={{ alignItems: "center", flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: "700",
                        color: "#7C3AED",
                      }}
                    >
                      {stats?.total || 0}
                    </Text>
                    <Text
                      style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}
                    >
                      Total Books
                    </Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: "#E5E7EB" }} />
                  <View style={{ alignItems: "center", flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: "700",
                        color: "#10B981",
                      }}
                    >
                      {stats?.byStatus?.read || 0}
                    </Text>
                    <Text
                      style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}
                    >
                      Read
                    </Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: "#E5E7EB" }} />
                  <View style={{ alignItems: "center", flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: "700",
                        color: "#F59E0B",
                      }}
                    >
                      {stats?.byStatus?.reading || 0}
                    </Text>
                    <Text
                      style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}
                    >
                      Reading
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: "#F3F4F6",
                  }}
                >
                  <StatPill
                    label="Unread"
                    count={stats?.byStatus?.unread || 0}
                    color="#6B7280"
                  />
                  <StatPill
                    label="Lent"
                    count={stats?.byStatus?.lent || 0}
                    color="#3B82F6"
                  />
                  <StatPill
                    label="Borrowed"
                    count={stats?.byStatus?.borrowed || 0}
                    color="#8B5CF6"
                  />
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 12,
                }}
              >
                Quick Actions
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/add-book")}
                style={{
                  backgroundColor: "#7C3AED",
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#7C3AED",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Plus color="#FFFFFF" size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#FFFFFF",
                      marginBottom: 2,
                    }}
                  >
                    Add New Book
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}
                  >
                    Scan barcode or enter manually
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Currently Reading */}
            {stats?.currentlyReading && stats.currentlyReading.length > 0 && (
              <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    Currently Reading
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/library?status=reading")}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#7C3AED",
                        fontWeight: "600",
                      }}
                    >
                      See All
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
                >
                  {stats.currentlyReading.map((book) => (
                    <TouchableOpacity
                      key={book.id}
                      onPress={() => router.push(`/book/${book.id}`)}
                      style={{
                        width: 140,
                        marginRight: 12,
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
                          height: 160,
                          backgroundColor: "#F3F4F6",
                          borderRadius: 8,
                          marginBottom: 8,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <BookOpen color="#9CA3AF" size={40} />
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
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                          marginBottom: 8,
                        }}
                        numberOfLines={1}
                      >
                        {book.author || "Unknown Author"}
                      </Text>
                      {book.progress_percentage !== null && (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <View
                            style={{
                              flex: 1,
                              height: 4,
                              backgroundColor: "#E5E7EB",
                              borderRadius: 2,
                              marginRight: 6,
                            }}
                          >
                            <View
                              style={{
                                width: `${Math.min(100, book.progress_percentage)}%`,
                                height: "100%",
                                backgroundColor: "#7C3AED",
                                borderRadius: 2,
                              }}
                            />
                          </View>
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#6B7280",
                              fontWeight: "600",
                            }}
                          >
                            {Math.round(book.progress_percentage)}%
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Recent Additions */}
            {stats?.recentBooks && stats.recentBooks.length > 0 && (
              <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    Recently Added
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/library")}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#7C3AED",
                        fontWeight: "600",
                      }}
                    >
                      See All
                    </Text>
                  </TouchableOpacity>
                </View>

                {stats.recentBooks.slice(0, 3).map((book) => (
                  <TouchableOpacity
                    key={book.id}
                    onPress={() => router.push(`/book/${book.id}`)}
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
                        {book.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6B7280",
                          marginBottom: 4,
                        }}
                        numberOfLines={1}
                      >
                        {book.author || "Unknown Author"}
                      </Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
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
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatPill({ label, count, color }) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "#F9FAFB",
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 12, color, fontWeight: "600", marginRight: 4 }}>
        {count}
      </Text>
      <Text style={{ fontSize: 12, color: "#6B7280" }}>{label}</Text>
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
