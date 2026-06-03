import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

interface Props {
  onHome: () => void;
  title?: string;
}

export default function Header({ onHome, title }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onHome} style={styles.logoButton}>
        <Image
          source={require('../../assets/Zombreros.png')}
          style={styles.logo}
          resizeMode="cover"
        />
      </TouchableOpacity>
      {title && <Text style={styles.title}>{title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#f4e4c1',
  },
  logoButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8b4513',
    marginBottom: 8,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8b4513',
    textAlign: 'center',
  },
  spacer: {
    width: 50,
  },
});
