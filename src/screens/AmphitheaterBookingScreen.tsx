import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StudioFlat } from '../types';

const { width, height } = Dimensions.get('window');
const ARENA_SIZE = Math.min(width * 0.25, 100);
const IS_SMALL_SCREEN = width < 400;

interface Props {
  studios: StudioFlat[];
  onStudioSelect: (studio: StudioFlat) => void;
  onBack: () => void;
}

export default function AmphitheaterBookingScreen({ studios, onStudioSelect, onBack }: Props) {
  const [selectedStudio, setSelectedStudio] = useState<number | null>(null);

  // Arrange studios in amphitheater tiers (semicircular rows)
  const getStudioPosition = (index: number, total: number) => {
    // Tier 1: Studios 1-4, Tier 2: Studio 5
    const tier = index < 4 ? 1 : 2;
    
    if (tier === 1) {
      // 4 studios in first tier
      const studiosInTier = 4;
      const angleSpread = IS_SMALL_SCREEN ? Math.PI * 0.8 : Math.PI; // Narrower spread on mobile
      const angleOffset = IS_SMALL_SCREEN ? Math.PI * 0.1 : 0; // Center the arc
      const angleStep = angleSpread / (studiosInTier + 1);
      const angle = angleStep * (index + 1) + angleOffset;
      
      const radius = ARENA_SIZE + (IS_SMALL_SCREEN ? 45 : 60);
      const x = radius * Math.cos(angle - Math.PI / 2);
      const y = radius * Math.sin(angle - Math.PI / 2);
      
      return { x, y, tier };
    } else {
      // 1 studio in second tier (centered)
      const radius = ARENA_SIZE + (IS_SMALL_SCREEN ? 90 : 120);
      const angle = Math.PI / 2; // Center position
      
      const x = radius * Math.cos(angle - Math.PI / 2);
      const y = radius * Math.sin(angle - Math.PI / 2);
      
      return { x, y, tier };
    }
  };

  const handleStudioPress = (studio: StudioFlat) => {
    setSelectedStudio(studio.id);
    setTimeout(() => onStudioSelect(studio), 300);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🏛️ Finca M&M</Text>
      <Text style={styles.subtitle}>Select Your Studio</Text>

      <View style={styles.amphitheaterContainer}>
        {/* Arena (center stage) */}
        <View style={styles.arena}>
          <Text style={styles.arenaText}>🎭</Text>
          <Text style={styles.arenaLabel}>ARENA</Text>
        </View>

        {/* Studio seats arranged in tiers */}
        {studios.map((studio, index) => {
          const { x, y, tier } = getStudioPosition(index, studios.length);
          const isSelected = selectedStudio === studio.id;
          
          return (
            <TouchableOpacity
              key={studio.id}
              style={[
                styles.studioSeat,
                {
                  left: width / 2 + x - (IS_SMALL_SCREEN ? 27.5 : 40),
                  top: IS_SMALL_SCREEN ? 150 + y : 200 + y,
                },
                !studio.available && styles.unavailableSeat,
                isSelected && styles.selectedSeat,
              ]}
              onPress={() => studio.available && handleStudioPress(studio)}
              disabled={!studio.available}
            >
              <View style={styles.seatContent}>
                <Text style={styles.seatName}>{studio.name}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Decorative columns */}
        <View style={[styles.column, styles.columnLeft]}>
          <Text style={styles.columnText}>🏛️</Text>
        </View>
        <View style={[styles.column, styles.columnRight]}>
          <Text style={styles.columnText}>🏛️</Text>
        </View>
      </View>

      {/* Studio details section */}
      <View style={styles.detailsSection}>
        <Text style={styles.detailsTitle}>Studio Details</Text>
        {studios.map((studio) => (
          <View key={studio.id} style={styles.studioCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.studioName}>
                {studio.name}
              </Text>
              <View style={[
                styles.statusBadge,
                !studio.available && styles.unavailableBadge
              ]}>
                <Text style={styles.statusText}>
                  {studio.available ? '✓ Available' : '✗ Booked'}
                </Text>
              </View>
            </View>
            <Text style={styles.studioDescription}>{studio.description}</Text>
            <View style={styles.studioMeta}>
              <Text style={styles.price}>${studio.price}/night</Text>
              <Text style={styles.capacity}>👥 {studio.capacity} guests</Text>
            </View>
            {studio.available && (
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => handleStudioPress(studio)}
              >
                <Text style={styles.selectButtonText}>Book This Studio</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.availableSeat]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.unavailableSeat]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.selectedSeat]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4e4c1',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  backButton: {
    padding: 20,
    paddingTop: 50,
  },
  backButtonText: {
    fontSize: 16,
    color: '#8b4513',
    fontWeight: '600',
  },
  title: {
    fontSize: IS_SMALL_SCREEN ? 22 : 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#8b4513',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: IS_SMALL_SCREEN ? 14 : 16,
    textAlign: 'center',
    color: '#a0522d',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  amphitheaterContainer: {
    height: IS_SMALL_SCREEN ? 400 : 500,
    position: 'relative',
    marginBottom: 30,
    backgroundColor: '#e8d4a8',
    borderRadius: 20,
    marginHorizontal: 10,
    borderWidth: 3,
    borderColor: '#8b4513',
    overflow: 'hidden',
  },
  arena: {
    position: 'absolute',
    width: ARENA_SIZE,
    height: ARENA_SIZE,
    borderRadius: ARENA_SIZE / 2,
    backgroundColor: '#d4a574',
    borderWidth: 3,
    borderColor: '#8b4513',
    left: width / 2 - ARENA_SIZE / 2,
    top: IS_SMALL_SCREEN ? 150 : 200,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  arenaText: {
    fontSize: IS_SMALL_SCREEN ? 30 : 40,
  },
  arenaLabel: {
    fontSize: IS_SMALL_SCREEN ? 10 : 12,
    fontWeight: 'bold',
    color: '#8b4513',
    marginTop: 5,
  },
  studioSeat: {
    position: 'absolute',
    width: IS_SMALL_SCREEN ? 55 : 80,
    height: IS_SMALL_SCREEN ? 55 : 80,
    borderRadius: IS_SMALL_SCREEN ? 27.5 : 40,
    backgroundColor: '#cd853f',
    borderWidth: 3,
    borderColor: '#8b4513',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  seatContent: {
    alignItems: 'center',
  },
  seatName: {
    fontSize: IS_SMALL_SCREEN ? 11 : 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  seatTier: {
    fontSize: 10,
    color: '#f4e4c1',
    marginTop: 2,
  },
  availableSeat: {
    backgroundColor: '#cd853f',
  },
  unavailableSeat: {
    backgroundColor: '#8b7355',
    opacity: 0.5,
  },
  selectedSeat: {
    backgroundColor: '#ff6347',
    transform: [{ scale: 1.1 }],
  },
  column: {
    position: 'absolute',
    width: IS_SMALL_SCREEN ? 30 : 40,
    height: IS_SMALL_SCREEN ? 80 : 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnLeft: {
    left: IS_SMALL_SCREEN ? 10 : 20,
    top: 50,
  },
  columnRight: {
    right: IS_SMALL_SCREEN ? 10 : 20,
    top: 50,
  },
  columnText: {
    fontSize: IS_SMALL_SCREEN ? 35 : 50,
  },
  detailsSection: {
    paddingHorizontal: 20,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8b4513',
    marginBottom: 15,
  },
  studioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#d4a574',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studioName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b4513',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailableBadge: {
    backgroundColor: '#999',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  studioDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  studioMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#cd853f',
  },
  capacity: {
    fontSize: 14,
    color: '#666',
  },
  selectButton: {
    backgroundColor: '#cd853f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8b4513',
  },
  legendText: {
    fontSize: 12,
    color: '#8b4513',
  },
});
