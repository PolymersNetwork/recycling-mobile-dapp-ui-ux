import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Audio } from 'expo-av';
import { useRecycling } from '../contexts/RecyclingContext';
import { useCamera } from '../hooks/useCamera';
import { useProjects } from '../hooks/useProjects';
import { Badge, Unit } from '../types';
import { calculateRewardForecast } from '../lib/forecast';
import { TOKEN_METADATA } from '../constants';
import { cn } from '../lib/utils';

export function RecycleScreen() {
  const { plyBalance, crtBalance, units, badges, cityMetrics, logRecycleUnit, submitBatch } = useRecycling();
  const { isScanning, scanResult, capturePhoto, scanQRCode, scanNFC, clearResult } = useCamera();
  const { projects, contributeToProject } = useProjects();
  
  const [confettiVisible, setConfettiVisible] = useState(false);
  const [successSound, setSuccessSound] = useState<Audio.Sound | null>(null);
  
  // Load sound
  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(require('../assets/success.mp3'));
      setSuccessSound(sound);
    };
    loadSound();
    return () => { successSound?.unloadAsync(); };
  }, []);

  const handleScan = async (type: 'camera' | 'qr' | 'nfc') => {
    try {
      let result: any;
      if (type === 'camera') result = await capturePhoto();
      else if (type === 'qr') result = await scanQRCode();
      else result = await scanNFC();

      // Log unit in context
      logRecycleUnit({
        city: result.location || 'Unknown',
        lat: Math.random() * 90,
        lng: Math.random() * 180
      });

      // Play sound & confetti
      setConfettiVisible(true);
      successSound && await successSound.replayAsync();
      setTimeout(() => setConfettiVisible(false), 3000);
    } catch (e) {
      console.error('Scan failed', e);
    }
  };

  const handleSubmitBatch = async () => {
    await submitBatch();
    setConfettiVisible(true);
    successSound && await successSound.replayAsync();
    setTimeout(() => setConfettiVisible(false), 3000);
  };

  const renderCityMetrics = () => {
    return Object.entries(cityMetrics).map(([city, metric]) => (
      <View key={city} className="p-4 mb-4 bg-gray-100 rounded-lg">
        <Text className="text-lg font-bold">{city}</Text>
        <Text>PLY Earned: {metric.forecast?.ply ?? metric.polyEarned}</Text>
        <Text>CRT Earned: {metric.forecast?.crt ?? metric.crtEarned}</Text>
        <Text>Batches: {metric.batchCount}</Text>
        <Text>Leaderboard: {metric.leaderboard.map(l => `${l.user}: ${l.pts}`).join(', ')}</Text>
      </View>
    ));
  };

  const renderBadges = () => {
    return badges.map((badge: Badge) => (
      <View key={badge.id} className="p-2 m-1 border rounded-lg items-center">
        <Image source={{ uri: badge.icon }} style={{ width: 50, height: 50 }} />
        <Text className="text-sm">{badge.name}</Text>
        <Text className="text-xs text-gray-500">{`Rarity: ${badge.rarity}%`}</Text>
        {badge.unlockedAt && <Text className="text-xs text-green-500">Unlocked!</Text>}
      </View>
    ));
  };

  const renderProjects = () => {
    return projects.map(project => (
      <View key={project.id} className="p-3 mb-3 bg-white rounded shadow">
        <Text className="font-semibold">{project.title}</Text>
        <Image source={{ uri: project.imageUrl }} style={{ width: '100%', height: 120 }} />
        <Text>{project.description}</Text>
        <Text>Raised: {project.currentAmount}/{project.targetAmount} {TOKEN_METADATA.PLY.symbol}</Text>
        <TouchableOpacity
          className="mt-2 bg-eco-primary px-3 py-1 rounded"
          onPress={() => contributeToProject(project.id, 10, 'PLY')}
        >
          <Text className="text-white">Contribute 10 PLY</Text>
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      {confettiVisible && <ConfettiCannon count={100} origin={{ x: 150, y: 0 }} fadeOut />}

      <View className="mb-4">
        <Text className="text-xl font-bold mb-2">Wallet Balances</Text>
        <Text>PLY: {plyBalance}</Text>
        <Text>CRT: {crtBalance}</Text>
      </View>

      <View className="mb-4">
        <Text className="text-xl font-bold mb-2">Scan Plastic</Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity onPress={() => handleScan('camera')} className="bg-eco-primary px-4 py-2 rounded">
            <Text className="text-white">Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleScan('qr')} className="bg-eco-success px-4 py-2 rounded">
            <Text className="text-white">QR</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleScan('nfc')} className="bg-eco-warning px-4 py-2 rounded">
            <Text className="text-white">NFC</Text>
          </TouchableOpacity>
        </View>
        {scanResult && (
          <View className="mt-2 p-2 border rounded">
            <Text>Type: {scanResult.plasticType}</Text>
            <Text>Confidence: {(scanResult.confidence * 100).toFixed(2)}%</Text>
            <Text>Tokens: {scanResult.tokensEarned}</Text>
            <Text>Verified: {scanResult.verified ? '✅' : '❌'}</Text>
          </View>
        )}
        {units.length > 0 && (
          <TouchableOpacity onPress={handleSubmitBatch} className="mt-3 bg-eco-primary px-4 py-2 rounded">
            <Text className="text-white font-bold">Submit Batch ({units.length} units)</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-xl font-bold mb-2">Multi-City Dashboard</Text>
        {Object.keys(cityMetrics).length === 0 ? (
          <ActivityIndicator size="large" />
        ) : (
          renderCityMetrics()
        )}
      </View>

      <View className="mb-4">
        <Text className="text-xl font-bold mb-2">NFT Badges</Text>
        <FlatList
          horizontal
          data={badges}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => renderBadges()}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View className="mb-4">
        <Text className="text-xl font-bold mb-2">Projects</Text>
        {projects.length === 0 ? <ActivityIndicator size="large" /> : renderProjects()}
      </View>
    </ScrollView>
  );
}
