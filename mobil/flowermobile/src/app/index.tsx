import * as Device from 'expo-device';
import { Platform, StyleSheet, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {api} from "@/services/api";
import { useState, useEffect } from 'react';

type Product = {
  id: number;
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
  const AnimatedIconAny = AnimatedIcon as any;

  const loadData = async () => {
    try {
      setError(null);
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err: any) {
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
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Üdvözlünk a Flower Mobile-ban!</ThemedText>
        <ThemedText style={styles.subtitle}>Fedezd fel a legfrissebb termékeinket és kategóriáinkat.</ThemedText>
        {loading && <AnimatedIconAny name="flower" size={64} />}
        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        {error && <ThemedText style={styles.error}>{error}</ThemedText>}

        {!loading && !error && (
          <>
            <ThemedText style={styles.sectionTitle}>Kategóriák</ThemedText>
            {categories.map(category => (
              <HintRow key={category.id} title={category.name} />
            ))}

            <ThemedText style={styles.sectionTitle}>Termékek</ThemedText>
            {products.map(product => (
              <View key={product.id} style={styles.productCard}>
                <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <ThemedText style={styles.productName}>{product.name}</ThemedText>
                  <ThemedText style={styles.productPrice}>{product.price} Ft</ThemedText>
                </View>
              </View>
            ))}
          </>
        )}
      </ThemedView>

      {(Device.isDevice || Platform.OS === 'web') && <WebBadge />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Spacing.two,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: Spacing.four,
    marginBottom: Spacing.three,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: Spacing.three,
  },
  productCard: {
    flexDirection: 'row',
    marginBottom: Spacing.three,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productInfo: {
    flex: 1,
    padding: Spacing.three,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 14,
    color: '#888',
    marginTop: Spacing.two,
  },
});

export default HomeScreen;