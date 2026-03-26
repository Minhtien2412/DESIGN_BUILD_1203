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
          title: t("tabs.home"),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: t("tabs.activity"),
        }}
      />
      <Tabs.Screen
        name="communication"
        options={{
          title: t("tabs.communication"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.account"),
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
          title: t("nav.home"),
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
          title: "CRM", // internal debug tab
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
          title: t("tabs.aiAssistant"),
        }}
      />
      <Tabs.Screen
        name="api-status"
        options={{
          href: null,
          title: "API Status", // internal debug tab
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
          title: t("nav.notifications"),
        }}
      />
      <Tabs.Screen
        name="design-services"
        options={{
          href: null,
          title: t("home.services"),
        }}
      />
      <Tabs.Screen
        name="construction-services"
        options={{
          href: null,
          title: t("home.constructionUtils"),
        }}
      />
    </Tabs>
  );
}
