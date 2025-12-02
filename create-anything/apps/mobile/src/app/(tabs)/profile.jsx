import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  User,
  Settings,
  LogOut,
  BookOpen,
  Heart,
  TrendingUp,
} from "lucide-react-native";
import { useAuth } from "@/utils/auth/useAuth";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auth, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
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
          Profile
        </Text>
        <Text style={{ fontSize: 15, color: "#6B7280" }}>
          Manage your account
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={{ padding: 20 }}>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#7C3AED",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <User color="#FFFFFF" size={40} />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 4,
              }}
            >
              Book Lover
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              {auth?.email || "user@librahome.com"}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <MenuItem
              icon={<Settings color="#6B7280" size={22} />}
              label="Settings"
              onPress={() => {}}
            />
            <MenuItem
              icon={<BookOpen color="#6B7280" size={22} />}
              label="My Library Stats"
              onPress={() => {}}
              showBorder
            />
            <MenuItem
              icon={<Heart color="#6B7280" size={22} />}
              label="Favorites"
              onPress={() => router.push("/library")}
              showBorder
            />
            <MenuItem
              icon={<LogOut color="#EF4444" size={22} />}
              label="Sign Out"
              onPress={handleSignOut}
              labelColor="#EF4444"
              showBorder={false}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>
            LibraHome v1.0.0
          </Text>
          <Text style={{ fontSize: 12, color: "#D1D5DB" }}>
            Your personal library manager
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  showBorder = true,
  labelColor = "#111827",
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: showBorder ? 1 : 0,
        borderBottomColor: "#F3F4F6",
      }}
    >
      <View style={{ marginRight: 12 }}>{icon}</View>
      <Text
        style={{ flex: 1, fontSize: 16, fontWeight: "500", color: labelColor }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
