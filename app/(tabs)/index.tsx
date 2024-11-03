import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getData, setData } from 'modules:widget';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedData } from '@/hooks/useSharedData';

export default function HomeScreen() {
  const [{ count, updatedAt }, setData] = useSharedData();
  const { top } = useSafeAreaInsets();

  const onPress = (type: 'increment' | 'decrement') => () => {
    setData((data) => {
      const newCount = Math.max(
        0,
        type === 'increment' ? data.count + 1 : data.count - 1,
      );
      return {
        count: newCount,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: top }]}>
      <ThemedView style={styles.countContainer}>
        <ThemedText type="title">{count}</ThemedText>
        {updatedAt && (
          <ThemedText type="default">Updated at: {updatedAt}</ThemedText>
        )}
      </ThemedView>
      <ThemedView style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={onPress('decrement')}>
          <ThemedText type="title">-</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onPress('increment')}>
          <ThemedText type="title">+</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  countContainer: {
    // flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 96,
    backgroundColor: '#0a7ea4',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 96,
    width: 96,
    padding: 32,
    borderRadius: 12,
    backgroundColor: '#0a7ea432',
  },
});
