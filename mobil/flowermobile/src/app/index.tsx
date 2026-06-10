import * as Device from "expo-device";
import {
  Platform,
  StyleSheet,
  View,
  Image,
  ScrollView,
  Button,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AnimatedIcon } from "@/components/animated-icon";
import { HintRow } from "@/components/hint-row";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebBadge } from "@/components/web-badge";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { api, imageUrl } from "@/services/api";
import { useState, useEffect } from "react";
import { green } from "react-native-reanimated/lib/typescript/Colors";
const { Alert } = require("react-native") as any;


type Product = {
  productId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
};

type Category = {
  id: number;
  name: string;
};

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const AnimatedIconAny = AnimatedIcon as any;

  const tryLogin = () => {
    const doLogin = async (username: string, password: string) => {
      try {
        setLoading(true);
        setError(null);

        const result = await (api as any).login?.(username, password);

        const ok = result && (result.token || result.success);
        if (ok) {
          const msg = "Sikeres bejelentkezés";
          if (Platform.OS === "web") {
            window.alert(msg);
          } else {
            require("react-native").Alert.alert(msg);
          }
        } else {
          throw new Error("Érvénytelen hitelesítés");
        }
      } catch (err: any) {
        console.error(err);
        const msg = err?.message || "Bejelentkezés sikertelen";
        setError("Bejelentkezés sikertelen. Ellenőrizd a hitelesítőadatokat.");
        if (Platform.OS === "web") {
          window.alert(msg);
        } else {
          require("react-native").Alert.alert("Hiba", msg);
        }
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === "web") {
      const username = window.prompt("Felhasználónév:");
      if (!username) return;
      const password = window.prompt("Jelszó:");
      if (password === null) return;
      void doLogin(username, password);
      return;
    }

    if (typeof Alert.prompt === "function") {
      Alert.prompt(
        "Bejelentkezés",
        "Add meg a felhasználóneved",
        (username: string) => {
          if (!username) return;
          Alert.prompt(
            "Jelszó",
            undefined,
            (password: string) => {
              if (password === undefined) return;
              void doLogin(username, password);
            },
            "secure-text",
          );
        },
      );
    } else {
      Alert.alert(
        "Bejelentkezés",
        "Ez a platform nem támogatja az egyszerű promptot. Kérlek használd a webes felületet vagy implementálj egy bejelentkező képernyőt.",
      );
    }
  };

  const loadData = async () => {
    try {
      setError(null);

      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
      setError("Nem sikerült betölteni az adatokat. Próbáld meg később.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>
            Üdvözlünk a Flower Mobile-ban!
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Fedezd fel a legfrissebb termékeinket és kategóriáinkat.
          </ThemedText>

          {loading && <AnimatedIconAny name="flower" size={64} />}

          {error && <ThemedText style={styles.error}>{error}</ThemedText>}

          {!loading && !error && (
            <>
              <Button
                title="Bejelentkezés"
                color={"#008000"}
                onPress={() => {
                  tryLogin();
                }}
              />
              <ThemedText style={styles.sectionTitle}>Kategóriák</ThemedText>

              {categories.map((category) => (
                <HintRow key={category.id} title={category.name} />
              ))}

                  <ThemedText style={styles.sectionTitle}>Termékek</ThemedText>
    
                  {products.map((product) => (
                    <Pressable
                      key={product.productId}
                      style={styles.productCard}
                      onPress={() =>
                        router.push(`/oneProduct?id=${product.productId}`)
                      }
                      android_ripple={{ color: "#eee" }}
                      accessibilityRole="button"
                    >
                      <Image
                        source={{
                          uri: `${imageUrl}/images/${product.imageUrl}`,
                        }}
                        style={styles.productImage}
                      />
    
                      <View style={styles.productInfo}>
                        <ThemedText style={styles.productName}>
                          {product.name} ({product.productId})
                        </ThemedText>
    
                        <ThemedText style={styles.productPrice}>
                          {product.price} Ft
                        </ThemedText>
                      </View>
                    </Pressable>
                  ))}
    
                </>
              )}
        </ThemedView>
      </ScrollView>

      {(Device.isDevice || Platform.OS === "web") && <WebBadge />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollContent: {
    paddingBottom: BottomTabInset + 20,
  },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: Spacing.two,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: Spacing.four,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: Spacing.four,
    marginBottom: Spacing.three,
  },

  error: {
    color: "red",
    textAlign: "center",
    marginTop: Spacing.three,
  },

  productCard: {
    flexDirection: "row",
    marginBottom: Spacing.three,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    overflow: "hidden",
  },

  productImage: {
    width: 100,
    height: 100,
  },

  productInfo: {
    flex: 1,
    padding: Spacing.three,
    justifyContent: "center",
  },

  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },

  productPrice: {
    fontSize: 14,
    color: "#888",
    marginTop: Spacing.two,
  },

  loginButton: {
    marginTop: Spacing.four,
    backgroundColor: "#4CAF50",
    paddingVertical: Spacing.two,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default HomeScreen;
