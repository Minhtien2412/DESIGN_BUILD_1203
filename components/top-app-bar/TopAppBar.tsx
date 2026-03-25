import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


interface TopAppBarProps {
    showBack?: boolean;
    onBack?: () => void;

    title?: string;
    centerComponent?: React.ReactNode;
    rightComponent?: React.ReactNode;

    backgroundColor?: string;
    style?: ViewStyle;
}

export function TopAppBar({
    showBack = true,
    onBack,
    title,
    centerComponent,
    rightComponent = null,
    backgroundColor = Colors.light.background,
    style,
}: TopAppBarProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const handleBack = () => {
        if (onBack) onBack();
        else if (router.canGoBack()) router.back();
    };

    const renderLeft = () => {
        if (showBack) {
            return (
                <TouchableOpacity onPress={handleBack} style={styles.iconButton} hitSlop={8}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.icon} />
                </TouchableOpacity>
            );
        }
        return null;
    };

    const renderCenter = () => {
        if (centerComponent) return centerComponent;
        if (title) {
            return (
                <Text style={styles.titleText} numberOfLines={1}>
                    {title}
                </Text>
            );
        }
        return null;
    };

    return (
        <View style={[styles.wrapper, { paddingTop: insets.top, backgroundColor }, style]}>
            <View style={styles.container}>
                <View style={styles.leftSection}>{renderLeft()}</View>

                <View style={styles.centerSection}>{renderCenter()}</View>

                {rightComponent ? (
                    <View style={styles.rightSection}>{rightComponent}</View>
                ) : title ? (
                    <View style={styles.rightSection} />
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    iconButton: {
    },
    titleText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
        textAlign: "center",
    },
    wrapper: {
        paddingBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    container: {
        height: 44,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    leftSection: {
        minWidth: 40,
        alignItems: "flex-start",
        justifyContent: "center",
    },
    centerSection: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    rightSection: {
        minWidth: 40,
        alignItems: "flex-end",
        justifyContent: "center",
    },
});