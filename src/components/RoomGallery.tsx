import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';

const { width } = Dimensions.get('window');

interface Props {
  images: any[];
  roomName: string;
}

export default function RoomGallery({ images, roomName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

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
      {/* Main image */}
      <TouchableOpacity onPress={() => setFullscreen(true)} activeOpacity={0.9}>
        <Image
          source={images[activeIndex]}
          style={styles.mainImage}
          resizeMode="cover"
        />
        <View style={styles.zoomHint}>
          <Text style={styles.zoomText}>🔍 Tap to enlarge</Text>
        </View>
      </TouchableOpacity>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnails}>
          {images.map((img, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveIndex(index)}
              style={[styles.thumbnail, activeIndex === index && styles.activeThumbnail]}
            >
              <Image source={img} style={styles.thumbnailImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Image counter */}
      <Text style={styles.counter}>{activeIndex + 1} / {images.length}</Text>

      {/* Fullscreen modal */}
      <Modal visible={fullscreen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setFullscreen(false)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Image
            source={images[activeIndex]}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
          {images.length > 1 && (
            <View style={styles.modalNav}>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => setActiveIndex(i => Math.max(0, i - 1))}
              >
                <Text style={styles.navBtnText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalCounter}>{activeIndex + 1} / {images.length}</Text>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => setActiveIndex(i => Math.min(images.length - 1, i + 1))}
              >
                <Text style={styles.navBtnText}>→</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  mainImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cd853f',
  },
  zoomHint: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  zoomText: {
    color: '#fff',
    fontSize: 11,
  },
  thumbnails: {
    marginTop: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#cd853f',
    overflow: 'hidden',
  },
  activeThumbnail: {
    borderColor: '#8b4513',
    borderWidth: 3,
  },
  thumbnailImage: {
    width: 60,
    height: 60,
  },
  counter: {
    textAlign: 'center',
    fontSize: 12,
    color: '#a0522d',
    marginTop: 5,
  },
  placeholder: {
    height: 180,
    backgroundColor: '#e8d4a8',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cd853f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeholderIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 14,
    color: '#a0522d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#cd853f',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fullscreenImage: {
    width: width,
    height: width,
  },
  modalNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 20,
  },
  navBtn: {
    backgroundColor: '#cd853f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8b4513',
  },
  navBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCounter: {
    color: '#fff',
    fontSize: 16,
  },
});
