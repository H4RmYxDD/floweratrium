import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api, imageUrl } from "@/services/api";

type Product = {
  id: number;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  image?: string;
};

const OneProduct = () => {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        let p: any = null;

        if ((api as any).getProduct) {
          p = await (api as any).getProduct(Number(id));
        } else {
          const all = await api.getProducts();
          p = all.find((x: any) => String(x.id) === String(id));
        }

        if (!p) {
          setError("A termék nem található.");
          setProduct(null);
        } else {
          setProduct(p);
        }
      } catch (e) {
        console.error(e);
        setError("Hiba történt a termék betöltésekor.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{error ?? "Nincs adat"}</Text>
      </View>
    );
  }

  const imageUri = product.imageUrl
    ? `${imageUrl}/images/${product.imageUrl}`
    : product.image || undefined;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.price}>Price: {product.price ?? " - " } Ft</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 260,
    marginBottom: 10,
    resizeMode: "cover",
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default OneProduct;
