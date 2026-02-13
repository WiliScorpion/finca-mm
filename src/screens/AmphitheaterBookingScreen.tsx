import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StudioFlat } from '../types';

const { width, height } = Dimensions.get('window');
const IS_SMALL_SCREEN = width < 400;
const CONTAINER_PADDING = 20;
const USABLE_WIDTH = width - (CONTAINER_PADDING * 2);
const SEAT_SIZE = IS_SMALL_SCREEN ? 45 : 80;
const ARENA_SIZE = IS_SMALL_SCREEN ? 60 : 100;

interface Props {
  studios: StudioFlat[];
  onStudioSelect: (studio: StudioFlat) => void;
  onBack: () => void;
}

export default function AmphitheaterBookingScreen({ studios, onStudioSelect, onBack }: Props) {
  const [selectedStudio, setSelectedStudio] = useState<number | null>(null);

  // Arrange studios in a circle around the arena
  const getStudioPosition = (index: number, total: number) => {
    // Arrange all 5 studios in a circle around the arena
    const angleStep = (Math.PI * 2) / total; // Full circle divided by number of studios
    const angle = angleStep * index - Math.PI / 2; // Start from top
    
    // Consistent distance from arena edge to button edge
    const arenaRadius = ARENA_SIZE / 2;
    const buttonRadius = SEAT_SIZE / 2;
    const gapDistance = IS_SMALL_SCREEN ? 15 : 20;
    const radius = arenaRadius + gapDistance + buttonRadius;
    
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    return { x, y };
  };

  const handleStudioPress = (studio: StudioFlat) => {
    setSelectedStudio(studio.id);
    setTimeout(() => onStudioSelect(studio), 300);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>🏛️ Finca M&M</Text>
      <Text style={styles.subtitle}>Select Your Studio</Text>

      <View style={styles.amphitheaterContainer}>
        {/* Arena (center stage) with Ecuadorian flag colors */}
        <View style={styles.arena}>
          <View style={styles.flagYellow} />
          <View style={styles.flagBlue} />
          <View style={styles.flagRed} />
          <View style={styles.arenaContent}>
            <Text style={styles.arenaText}>🎭 🎭</Text>
            <Text style={styles.arenaLabel}>ARENA</Text>
          </View>
        </View>

        {/* Studio seats arranged in circle */}
        {studios.map((studio, index) => {
          const { x, y } = getStudioPosition(index, studios.length);
          const isSelected = selectedStudio === studio.id;
          const arenaCenter = IS_SMALL_SCREEN ? (280 - ARENA_SIZE) / 2 : (400 - ARENA_SIZE) / 2;
          
          return (
            <TouchableOpacity
              key={studio.id}
              style={[
                styles.studioSeat,
                {
                  left: (USABLE_WIDTH / 2) + CONTAINER_PADDING + x - (SEAT_SIZE / 2),
                  top: arenaCenter + (ARENA_SIZE / 2) + y - (SEAT_SIZE / 2),
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
    paddingTop: 50,
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
    height: IS_SMALL_SCREEN ? 280 : 400,
    position: 'relative',
    marginBottom: 30,
    backgroundColor: '#e8d4a8',
    borderRadius: 20,
    marginHorizontal: CONTAINER_PADDING,
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
    left: (USABLE_WIDTH / 2) + CONTAINER_PADDING - (ARENA_SIZE / 2),
    top: IS_SMALL_SCREEN ? (280 - ARENA_SIZE) / 2 : (400 - ARENA_SIZE) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  flagYellow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#FFD100',
  },
  flagBlue: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: '#0072CE',
  },
  flagRed: {
    position: 'absolute',
    top: '75%',
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: '#EF3340',
  },
  arenaContent: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arenaText: {
    fontSize: IS_SMALL_SCREEN ? 20 : 40,
  },
  arenaLabel: {
    fontSize: IS_SMALL_SCREEN ? 7 : 12,
    fontWeight: 'bold',
    color: '#8b4513',
    marginTop: 2,
  },
  studioSeat: {
    position: 'absolute',
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: SEAT_SIZE / 2,
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
    fontSize: IS_SMALL_SCREEN ? 7 : 11,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 2,
    paddingVertical: 2,
    maxWidth: SEAT_SIZE - 8,
    overflow: 'hidden',
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
