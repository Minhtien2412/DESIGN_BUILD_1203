/**
 * Tasks & Milestones Screen - Quản lý công việc
 * Danh sách tasks và milestones theo dự án
 * @updated 2026-02-04
 */
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#7CB342",
  secondary: "#2196F3",
  accent: "#FF9800",
  danger: "#F44336",
  success: "#4CAF50",
  purple: "#9C27B0",
  text: "#212121",
  textLight: "#757575",
  border: "#E0E0E0",
  white: "#FFFFFF",
};

// Priority colors
const PRIORITY = {
  high: { color: COLORS.danger, label: "Cao", icon: "arrow-up" },
  medium: { color: COLORS.accent, label: "Trung bình", icon: "remove" },
  low: { color: COLORS.success, label: "Thấp", icon: "arrow-down" },
};

// Status
const STATUS = {
  todo: { color: COLORS.textLight, label: "Chờ làm", bg: "#f0f0f0" },
  in_progress: { color: COLORS.secondary, label: "Đang làm", bg: "#E3F2FD" },
  review: { color: COLORS.purple, label: "Chờ duyệt", bg: "#F3E5F5" },
  completed: { color: COLORS.success, label: "Hoàn thành", bg: "#E8F5E9" },
  blocked: { color: COLORS.danger, label: "Bị chặn", bg: "#FFEBEE" },
};

// Mock milestones
const milestones = [
  {
    id: "m1",
    name: "Hoàn thành thiết kế",
    date: "15/01/2026",
    completed: true,
    tasksCompleted: 5,
    totalTasks: 5,
  },
  {
    id: "m2",
    name: "Xin giấy phép XD",
    date: "01/02/2026",
    completed: false,
    tasksCompleted: 2,
    totalTasks: 4,
  },
  {
    id: "m3",
    name: "Hoàn thành móng",
    date: "01/03/2026",
    completed: false,
    tasksCompleted: 0,
    totalTasks: 6,
  },
  {
    id: "m4",
    name: "Cất nóc",
    date: "01/05/2026",
    completed: false,
    tasksCompleted: 0,
    totalTasks: 8,
  },
];

// Mock tasks
const tasks = [
  {
    id: "1",
    title: "Khảo sát địa chất",
    description: "Khảo sát địa chất và lấy mẫu đất tại công trình",
    status: "completed",
    priority: "high",
    assignee: "Nguyễn Văn A",
    dueDate: "10/01/2026",
    milestone: "m1",
    tags: ["Khảo sát", "Địa chất"],
  },
  {
    id: "2",
    title: "Thiết kế bản vẽ kiến trúc",
    description: "Hoàn thiện bản vẽ kiến trúc tầng 1-3",
    status: "completed",
    priority: "high",
    assignee: "KTS. Trần B",
    dueDate: "12/01/2026",
    milestone: "m1",
    tags: ["Thiết kế", "Kiến trúc"],
  },
  {
    id: "3",
    title: "Nộp hồ sơ xin phép XD",
    description: "Chuẩn bị và nộp hồ sơ xin phép xây dựng tại UBND",
    status: "in_progress",
    priority: "high",
    assignee: "Lê Thị C",
    dueDate: "20/01/2026",
    milestone: "m2",
    tags: ["Pháp lý", "Giấy phép"],
  },
  {
    id: "4",
    title: "Đấu thầu vật liệu móng",
    description: "Lựa chọn nhà cung cấp vật liệu cho phần móng",
    status: "in_progress",
    priority: "medium",
    assignee: "Nguyễn Văn D",
    dueDate: "25/01/2026",
    milestone: "m2",
    tags: ["Mua sắm", "Vật liệu"],
  },
  {
    id: "5",
    title: "Thuê đội thi công móng",
    description: "Tìm và ký hợp đồng với đội thi công chuyên móng",
    status: "todo",
    priority: "high",
    assignee: "Trần Văn E",
    dueDate: "28/01/2026",
    milestone: "m3",
    tags: ["Nhân sự", "Thi công"],
  },
  {
    id: "6",
    title: "Lập kế hoạch thi công",
    description: "Xây dựng timeline chi tiết cho giai đoạn thi công thô",
    status: "review",
    priority: "medium",
    assignee: "PM. Nguyễn F",
    dueDate: "30/01/2026",
    milestone: "m3",
    tags: ["Kế hoạch"],
  },
  {
    id: "7",
    title: "Kiểm tra an toàn lao động",
    description: "Đánh giá và chuẩn bị thiết bị ATLĐ cho công trường",
    status: "blocked",
    priority: "high",
    assignee: "Phạm G",
    dueDate: "05/02/2026",
    milestone: "m3",
    tags: ["An toàn", "ATLĐ"],
  },
];

const tabs = ["Tất cả", "Đang làm", "Chờ làm", "Hoàn thành"];

export default function TasksScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchText, setSearchText] = useState("");
  const [showMilestones, setShowMilestones] = useState(true);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    if (activeTab === "Tất cả") return matchesSearch;
    if (activeTab === "Đang làm")
      return matchesSearch && task.status === "in_progress";
    if (activeTab === "Chờ làm") return matchesSearch && task.status === "todo";
    if (activeTab === "Hoàn thành")
      return matchesSearch && task.status === "completed";
    return matchesSearch;
  });

  const handleAddTask = () => {
    Alert.alert("Tạo Task", "Chức năng tạo task mới sẽ được bổ sung");
  };

  const renderMilestone = (milestone: (typeof milestones)[0]) => {
    const progress =
      milestone.totalTasks > 0
        ? (milestone.tasksCompleted / milestone.totalTasks) * 100
        : 0;

    return (
      <TouchableOpacity
        key={milestone.id}
        style={[styles.milestoneCard, { backgroundColor: cardBg }]}
      >
        <View style={styles.milestoneHeader}>
          <View
            style={[
              styles.milestoneDot,
              milestone.completed && styles.milestoneDotCompleted,
            ]}
          >
            {milestone.completed && (
              <Ionicons name="checkmark" size={12} color="#fff" />
            )}
          </View>
          <View style={styles.milestoneInfo}>
            <Text style={[styles.milestoneName, { color: textColor }]}>
              {milestone.name}
            </Text>
            <Text style={styles.milestoneDate}>
              <Ionicons name="calendar-outline" size={12} /> {milestone.date}
            </Text>
          </View>
          <View style={styles.milestoneProgress}>
            <Text style={styles.milestoneProgressText}>
              {milestone.tasksCompleted}/{milestone.totalTasks}
            </Text>
          </View>
        </View>
        <View style={styles.milestoneProgressBar}>
          <View
            style={[styles.milestoneProgressFill, { width: `${progress}%` }]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderTask = ({ item }: { item: (typeof tasks)[0] }) => {
    const status = STATUS[item.status as keyof typeof STATUS];
    const priority = PRIORITY[item.priority as keyof typeof PRIORITY];

    return (
      <TouchableOpacity style={[styles.taskCard, { backgroundColor: cardBg }]}>
        <View style={styles.taskHeader}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              item.status === "completed" && styles.checkboxChecked,
            ]}
          >
            {item.status === "completed" && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </TouchableOpacity>
          <View style={styles.taskInfo}>
            <Text
              style={[
                styles.taskTitle,
                { color: textColor },
                item.status === "completed" && styles.taskTitleCompleted,
              ]}
            >
              {item.title}
            </Text>
            <Text style={styles.taskDescription} numberOfLines={1}>
              {item.description}
            </Text>
          </View>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priority.color + "20" },
            ]}
          >
            <Ionicons
              name={priority.icon as any}
              size={12}
              color={priority.color}
            />
          </View>
        </View>

        <View style={styles.taskMeta}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <View
              style={[styles.statusDot, { backgroundColor: status.color }]}
            />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>

          <View style={styles.taskAssignee}>
            <Ionicons name="person-circle" size={16} color={COLORS.textLight} />
            <Text style={styles.assigneeText}>{item.assignee}</Text>
          </View>

          <View style={styles.taskDueDate}>
            <Ionicons name="calendar" size={14} color={COLORS.textLight} />
            <Text style={styles.dueDateText}>{item.dueDate}</Text>
          </View>
        </View>

        <View style={styles.taskTags}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Tasks & Milestones",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.secondary },
          headerTintColor: "#fff",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleAddTask}
              style={{ marginRight: 12 }}
            >
              <Ionicons name="add-circle" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm kiếm task..."
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Milestones Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowMilestones(!showMilestones)}
        >
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flag" size={18} color={COLORS.accent} />
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Milestones
            </Text>
            <View style={styles.milestoneBadge}>
              <Text style={styles.milestoneBadgeText}>{milestones.length}</Text>
            </View>
          </View>
          <Ionicons
            name={showMilestones ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.textLight}
          />
        </TouchableOpacity>

        {showMilestones && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.milestonesScroll}
          >
            {milestones.map(renderMilestone)}
          </ScrollView>
        )}

        {/* Tasks Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="checkbox" size={18} color={COLORS.secondary} />
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Tasks
            </Text>
            <View style={styles.taskCountBadge}>
              <Text style={styles.taskCountText}>{filteredTasks.length}</Text>
            </View>
          </View>
        </View>

        {filteredTasks.map((task) => (
          <View key={task.id} style={{ paddingHorizontal: 12 }}>
            {renderTask({ item: task })}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  tabsContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  milestoneBadge: {
    backgroundColor: COLORS.accent + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  milestoneBadgeText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: "600",
  },
  taskCountBadge: {
    backgroundColor: COLORS.secondary + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  taskCountText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: "600",
  },
  milestonesScroll: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 12,
  },
  milestoneCard: {
    width: 200,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  milestoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  milestoneDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  milestoneDotCompleted: {
    backgroundColor: COLORS.success,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 14,
    fontWeight: "600",
  },
  milestoneDate: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  milestoneProgress: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  milestoneProgressText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
  },
  milestoneProgressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  milestoneProgressFill: {
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 2,
  },
  taskCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: COLORS.textLight,
  },
  taskDescription: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  taskAssignee: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  assigneeText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  taskDueDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dueDateText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  taskTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 6,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
});
