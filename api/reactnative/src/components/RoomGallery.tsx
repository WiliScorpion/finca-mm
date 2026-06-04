import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');
const THUMB_SIZE = 70;

interface Props {
  images: any[];
  roomName: string;
}

export default function RoomGallery({ images, roomName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  if (!images || images.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderIcon}>🏠</Text>
        <Text style={styles.placeholderText}>No photos available yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Main large image */}
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => setExpanded(!expanded)}
        style={styles.mainImageWrapper}
      >
        <Image
          source={images[activeIndex]}
          style={[styles.mainImage, expanded && styles.mainImageExpanded]}
          resizeMode={expanded ? 'contain' : 'cover'}
        />

        {/* Overlay controls */}
        <View style={styles.overlayTop}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{roomName}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeIndex + 1} / {images.length}</Text>
          </View>
        </View>

        <View style={styles.overlayBottom}>
          <Text style={styles.tapHint}>{expanded ? '✕ tap to collapse' : '⛶ tap to expand'}</Text>
        </View>

        {/* Left / Right arrows */}
        {images.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.arrow, styles.arrowLeft]}
              onPress={(e) => { e.stopPropagation(); setActiveIndex(i => Math.max(0, i - 1)); }}
            >
              <Text style={styles.arrowText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrow, styles.arrowRight]}
              onPress={(e) => { e.stopPropagation(); setActiveIndex(i => Math.min(images.length - 1, i + 1)); }}
            >
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          </>
        )}
      </TouchableOpacity>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {images.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setActiveIndex(i)}>
            <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Thumbnail strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.thumbnailStrip}
        contentContainerStyle={styles.thumbnailContent}
      >
        {images.map((img, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setActiveIndex(i)}
            style={[styles.thumbWrapper, i === activeIndex && styles.thumbWrapperActive]}
          >
            <Image source={img} style={styles.thumb} resizeMode="cover" />
            {i === activeIndex && <View style={styles.thumbOverlay} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  mainImageWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#cd853f',
    backgroundColor: '#000',
    shadowColor: '#8b4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  mainImage: {
    width: '100%',
    height: 220,
  },
  mainImageExpanded: {
    height: 380,
  },
  overlayTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  tapHint: {
    color: '#fff',
    fontSize: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  arrow: {
    position: 'absolute',
    top: '40%',
    backgroundColor: 'rgba(139,69,19,0.7)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowLeft: {
    left: 10,
  },
  arrowRight: {
    right: 10,
  },
  arrowText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#d4a574',
    margin: 3,
  },
  dotActive: {
    backgroundColor: '#8b4513',
    width: 18,
    height: 7,
    borderRadius: 4,
  },
  thumbnailStrip: {
    marginTop: 10,
  },
  thumbnailContent: {
    paddingHorizontal: 2,
    gap: 8,
  },
  thumbWrapper: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#d4a574',
    marginRight: 8,
  },
  thumbWrapperActive: {
    borderColor: '#8b4513',
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
  thumbOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(139,69,19,0.2)',
  },
  placeholder: {
    height: 160,
    backgroundColor: '#e8d4a8',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#cd853f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#a0522d',
  },
});
