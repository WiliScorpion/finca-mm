import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { STUDIOS } from '../data/studios';
import { StudioFlat } from '../types';
import AmphitheaterBookingScreen from './AmphitheaterBookingScreen';

interface Props {
  onSelectStudio: (studio: StudioFlat) => void;
}

export default function StudiosListScreen({ onSelectStudio }: Props) {
  const [viewMode, setViewMode] = useState<'list' | 'amphitheater'>('amphitheater');

  if (viewMode === 'amphitheater') {
    return (
      <AmphitheaterBookingScreen
        studios={STUDIOS}
        onStudioSelect={onSelectStudio}
        onBack={() => setViewMode('list')}
      />
    );
  }
  const renderStudio = ({ item }: { item: StudioFlat }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onSelectStudio(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.studioName}>{item.name}</Text>
        <Text style={styles.price}>${item.price}/night</Text>
      </View>
      
      <Text style={styles.description}>{item.description}</Text>
      
      <View style={styles.details}>
        <Text style={styles.capacity}>👥 Up to {item.capacity} guests</Text>
        <Text style={[styles.status, item.available ? styles.available : styles.unavailable]}>
          {item.available ? '✓ Available' : '✗ Booked'}
        </Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.amenities}>
        {item.amenities.map((amenity, index) => (
          <View key={index} style={styles.amenityTag}>
            <Text style={styles.amenityText}>{amenity}</Text>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.bookButton, !item.available && styles.bookButtonDisabled]}
        onPress={() => onSelectStudio(item)}
        disabled={!item.available}
      >
        <Text style={styles.bookButtonText}>
          {item.available ? 'Book Now' : 'Not Available'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Finca M&M</Text>
        <TouchableOpacity 
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'list' ? 'amphitheater' : 'list')}
        >
          <Text style={styles.viewToggleText}>
            {viewMode === 'list' ? '🏛️ Amphitheater View' : '📋 List View'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Choose your perfect studio</Text>
      
      <FlatList
        data={STUDIOS}
        renderItem={renderStudio}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4e4c1',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8b4513',
  },
  viewToggle: {
    backgroundColor: '#cd853f',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8b4513',
  },
  viewToggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#a0522d',
    paddingHorizontal: 15,
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#d4a574',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  studioName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b4513',
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#cd853f',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  capacity: {
    fontSize: 14,
    color: '#8b4513',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  available: {
    color: '#4CAF50',
  },
  unavailable: {
    color: '#F44336',
  },
  amenities: {
    marginBottom: 15,
  },
  amenityTag: {
    backgroundColor: '#e8d4a8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cd853f',
  },
  amenityText: {
    fontSize: 12,
    color: '#8b4513',
  },
  bookButton: {
    backgroundColor: '#cd853f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8b4513',
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
    borderColor: '#999',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
