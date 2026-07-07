import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import FilterChip from '@/components/FilterChip';
import ScreenContainer from '@/components/ScreenContainer';
import SectionCard from '@/components/SectionCard';
import {
  INVENTORY_GRID_HEIGHT,
  INVENTORY_GRID_WIDTH,
  inventoryPresets,
} from '@/constants/inventoryPresets';
import { colors, radius, spacing } from '@/constants/theme';
import { CELL_EMPTY, CELL_UNKNOWN, emptyCellGrid, simulateInventory } from '@/utils/inventorySim';

const itemColors = ['#E4405F', '#B26D1F', '#9431A5'];

// Paint tools: miss (revealed empty), one per item type, eraser.
type Tool = 'miss' | 'erase' | 0 | 1 | 2;

export default function InventoryScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const [presetId, setPresetId] = useState(inventoryPresets[0].id);
  const [roundIndex, setRoundIndex] = useState(0);
  const [tool, setTool] = useState<Tool>('miss');
  const [cells, setCells] = useState(() => emptyCellGrid(INVENTORY_GRID_WIDTH, INVENTORY_GRID_HEIGHT));

  const preset = inventoryPresets.find((p) => p.id === presetId) ?? inventoryPresets[0];
  const items = preset.rounds[Math.min(roundIndex, preset.rounds.length - 1)];

  const result = useMemo(
    () => simulateInventory(INVENTORY_GRID_WIDTH, INVENTORY_GRID_HEIGHT, items, cells),
    [items, cells]
  );

  const resetBoard = () => setCells(emptyCellGrid(INVENTORY_GRID_WIDTH, INVENTORY_GRID_HEIGHT));

  const selectPreset = (id: string) => {
    setPresetId(id);
    setRoundIndex(0);
    resetBoard();
  };

  const selectRound = (index: number) => {
    setRoundIndex(index);
    resetBoard();
  };

  const tapCell = (x: number, y: number) => {
    const applied = tool === 'erase' ? CELL_UNKNOWN : tool === 'miss' ? CELL_EMPTY : tool;
    setCells((prev) => {
      const next = prev.map((row) => [...row]);
      // Tapping again with the same tool clears the cell.
      next[y][x] = prev[y][x] === applied ? CELL_UNKNOWN : applied;
      return next;
    });
  };

  const bestKeys = useMemo(() => new Set((result?.best ?? []).map((b) => `${b.x},${b.y}`)), [result]);

  // Fit the 9-wide grid to the screen (page padding + per-cell gap).
  const cellSize = Math.min(
    44,
    Math.floor((screenWidth - spacing.lg * 2 - (INVENTORY_GRID_WIDTH - 1) * 3) / INVENTORY_GRID_WIDTH)
  );

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }} testID="inventory-page">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {inventoryPresets.map((p) => (
            <FilterChip
              key={p.id}
              label={p.label}
              selected={p.id === presetId}
              onPress={() => selectPreset(p.id)}
              testID={`inv-preset-${p.id}`}
            />
          ))}
        </ScrollView>
        <Text style={styles.presetName}>{preset.name}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {preset.rounds.map((_, i) => (
            <FilterChip
              key={i}
              label={`Round ${i + 1}`}
              selected={i === roundIndex}
              onPress={() => selectRound(i)}
              testID={`inv-round-${i + 1}`}
            />
          ))}
        </ScrollView>

        <SectionCard title="Mark what you've revealed">
          <View style={styles.toolRow}>
            <ToolButton
              label="Miss"
              color={colors.textSecondary}
              selected={tool === 'miss'}
              onPress={() => setTool('miss')}
              testID="inv-tool-miss"
            />
            {items.map((it, i) => (
              <ToolButton
                key={it.name}
                label={`${it.name} ${it.width}×${it.height} ×${it.count}`}
                color={itemColors[i]}
                selected={tool === i}
                onPress={() => setTool(i as Tool)}
                testID={`inv-tool-item-${i}`}
              />
            ))}
            <ToolButton
              label="Erase"
              color={colors.textMuted}
              selected={tool === 'erase'}
              onPress={() => setTool('erase')}
              testID="inv-tool-erase"
            />
          </View>

          <View style={styles.grid}>
            {cells.map((row, y) => (
              <View key={y} style={styles.gridRow}>
                {row.map((cell, x) => {
                  const p = result ? result.prob[y][x] : 0;
                  const isBest = bestKeys.has(`${x},${y}`);
                  return (
                    <Pressable
                      key={x}
                      onPress={() => tapCell(x, y)}
                      testID={`inv-cell-${x}-${y}`}
                      style={[
                        styles.cell,
                        { width: cellSize, height: cellSize },
                        cell === CELL_UNKNOWN && {
                          backgroundColor: `rgba(18, 138, 250, ${(p * 0.8).toFixed(3)})`,
                        },
                        cell === CELL_EMPTY && styles.cellMiss,
                        cell >= 0 && { backgroundColor: itemColors[cell] },
                        isBest && styles.cellBest,
                      ]}
                    >
                      {cell === CELL_UNKNOWN && result && p > 0 && (
                        <Text style={[styles.cellText, p >= 0.55 && styles.cellTextLight, isBest && styles.cellTextBest]}>
                          {Math.round(p * 100)}
                        </Text>
                      )}
                      {cell === CELL_EMPTY && <Ionicons name="close" size={16} color="#fff" />}
                      {cell >= 0 && <Ionicons name="cube" size={14} color="#fff" />}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          {!result && (
            <Text style={styles.warning} testID="inv-impossible">
              No layout fits these marks — double-check the revealed cells.
            </Text>
          )}
          {result && (
            <Text style={styles.meta}>
              Numbers are the chance (%) each tile hides an item · best tiles highlighted · sampled{' '}
              {result.successes.toLocaleString()} valid layouts
            </Text>
          )}

          <Pressable onPress={resetBoard} style={({ pressed }) => [styles.resetButton, pressed && { opacity: 0.7 }]} testID="inv-reset">
            <Ionicons name="refresh" size={16} color={colors.primary} />
            <Text style={styles.resetLabel}>Reset board</Text>
          </Pressable>
        </SectionCard>

        <Text style={styles.footer}>
          Probabilities are guidance, not guarantees. Engine approach based on jozsefsallai/ba-tools (MIT),
          extended to account for revealed item tiles.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function ToolButton({
  label,
  color,
  selected,
  onPress,
  testID,
}: {
  label: string;
  color: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={[styles.toolButton, selected && { backgroundColor: color, borderColor: color }]}
    >
      <View style={[styles.toolSwatch, { backgroundColor: selected ? '#fff' : color }]} />
      <Text style={[styles.toolLabel, selected && styles.toolLabelSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  presetName: {
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  toolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '100%',
  },
  toolSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  toolLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    flexShrink: 1,
  },
  toolLabelSelected: {
    color: '#fff',
  },
  grid: {
    gap: 3,
    alignSelf: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 3,
  },
  cell: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  cellMiss: {
    backgroundColor: colors.textSecondary,
  },
  cellBest: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  cellText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  cellTextLight: {
    color: '#fff',
  },
  cellTextBest: {
    fontWeight: '800',
  },
  warning: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  meta: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: spacing.md,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  resetLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
});
