import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Button } from 'react-native';
import { apiClient } from '../api/client';

export default function MainScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.getData();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Finca M&M!</Text>
      
      <Button title="Fetch Data" onPress={fetchData} />
      
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      {data && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>Data loaded successfully!</Text>
          <Text>{JSON.stringify(data, null, 2)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dataContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  dataText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});
