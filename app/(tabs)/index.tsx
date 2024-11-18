import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedData } from '@/hooks/useSharedData';
import useTimeAgo from '@/hooks/useTimeAgo';

import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const [{ count, updatedAt }, setData, error] = useSharedData();
  const { top } = useSafeAreaInsets();

  const timeAgo = useTimeAgo(updatedAt);

  const onPress = (type: 'increment' | 'decrement') => () => {
    setData(({ count }) => {
      const newCount = Math.max(0, type === 'increment' ? count + 1 : count - 1);
      return {
        count: newCount,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: top }]}>
      <ThemedView style={styles.countContainer}>
        <ThemedText type="title">{error ?? count}</ThemedText>
        {updatedAt && <ThemedText type="default">{timeAgo}</ThemedText>}
      </ThemedView>
      <ThemedView style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={onPress('decrement')}>
          <ThemedText type="title" lightColor="white" darkColor="white">
            -
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onPress('increment')}>
          <ThemedText type="title" lightColor="white" darkColor="white">
            +
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 32,
  },
  countContainer: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 96,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    width: 64,
    padding: 12,
    borderRadius: 90,
    backgroundColor: Colors.light.tint,
  },
});
