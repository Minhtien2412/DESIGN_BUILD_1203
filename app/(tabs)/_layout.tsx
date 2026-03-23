import { CustomTabBar } from "@/components/navigation/custom-tab-bar";
import { useI18n } from "@/services/i18nService";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* ══════ VISIBLE TABS (Vua Tho style) ══════ */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Hoạt động",
        }}
      />
      <Tabs.Screen
        name="communication"
        options={{
          title: "Liên lạc",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
        }}
      />

      {/* ══════ HIDDEN TABS (accessible via navigation) ══════ */}
      <Tabs.Screen
        name="shop"
        options={{
          href: null,
          title: t("nav.shop"),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          href: null,
          title: t("nav.community"),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          href: null,
          title: t("nav.projects"),
        }}
      />
      <Tabs.Screen
        name="home-construction"
        options={{
          href: null,
          title: "Home XD",
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          href: null,
          title: t("nav.live"),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          href: null,
          title: t("nav.news"),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          href: null,
          title: t("nav.menu"),
        }}
      />
      <Tabs.Screen
        name="call-test"
        options={{
          href: null,
          title: t("nav.calls"),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          href: null,
          title: t("nav.contacts"),
        }}
      />
      <Tabs.Screen
        name="test-crm"
        options={{
          href: null,
          title: "CRM",
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          href: null,
          title: t("nav.projects"),
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          href: null,
          title: "AI Assistant",
        }}
      />
      <Tabs.Screen
        name="api-status"
        options={{
          href: null,
          title: "API Status",
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          href: null,
          title: t("nav.messages"),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          title: "Thông báo",
        }}
      />
      <Tabs.Screen
        name="design-services"
        options={{
          href: null,
          title: "Dịch vụ thiết kế",
        }}
      />
      <Tabs.Screen
        name="construction-services"
        options={{
          href: null,
          title: "Dịch vụ xây dựng",
        }}
      />
    </Tabs>
  );
}
