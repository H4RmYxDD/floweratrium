import { ThemedText } from "@/components/themed-text";
import { View, StyleSheet } from "react-native";

const ProfileScreen = () => {
    return (
        <View style={styles.container}>
            <ThemedText style={styles.sectionTitle}>
                Profil
            </ThemedText>

            <ThemedText style={styles.sectionSubtitle}>
                Ez a profil oldal.
            </ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#ffffff",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#666666",
    },
});