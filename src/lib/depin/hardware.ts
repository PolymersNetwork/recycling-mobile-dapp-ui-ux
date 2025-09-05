export interface DePINDevice {
  id: string;
  type: 'smart_bin' | 'weighing_scale' | 'contamination_scanner' | 'collection_truck';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'online' | 'offline' | 'maintenance' | 'error';
  last_ping: string;
  firmware_version: string;
  battery_level?: number;
  uptime: number; // in seconds
  metrics: DeviceMetrics;
  node_address: string; // Solana wallet address of the node
}

export interface DeviceMetrics {
  total_scans: number;
  total_weight: number;
  contamination_detections: number;
  uptime_percentage: number;
  rewards_distributed: number;
  last_maintenance: string;
}

export interface IoTData {
  device_id: string;
  timestamp: string;
  data: {
    weight: number;
    contamination_score: number;
    item_type: string;
    image_hash?: string;
    qr_code?: string;
    nfc_data?: string;
    temperature?: number;
    humidity?: number;
    bin_capacity?: number;
  };
  signature: string; // Device signature for authenticity
}

export interface ValidationResult {
  valid: boolean;
  confidence: number;
  reward_amount: number;
  multipliers: {
    contamination_bonus: number;
    streak_bonus: number;
    location_bonus: number;
  };
  metadata: {
    ai_classification: string;
    weight_verified: boolean;
    location_verified: boolean;
    device_trusted: boolean;
  };
}

export class DePINHardwareManager {
  private devices: Map<string, DePINDevice> = new Map();
  private validationNodes: Set<string> = new Set();

  async registerDevice(device: Omit<DePINDevice, 'id'>): Promise<string> {
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newDevice: DePINDevice = {
      id: deviceId,
      ...device,
      metrics: {
        total_scans: 0,
        total_weight: 0,
        contamination_detections: 0,
        uptime_percentage: 100,
        rewards_distributed: 0,
        last_maintenance: new Date().toISOString(),
      }
    };

    this.devices.set(deviceId, newDevice);
    console.log(`Device registered: ${deviceId}`);
    
    return deviceId;
  }

  async processIoTData(data: IoTData): Promise<ValidationResult> {
    const device = this.devices.get(data.device_id);
    
    if (!device) {
      throw new Error(`Device not found: ${data.device_id}`);
    }

    // Verify device signature
    const isSignatureValid = await this.verifyDeviceSignature(data);
    if (!isSignatureValid) {
      throw new Error('Invalid device signature');
    }

    // Update device metrics
    this.updateDeviceMetrics(device, data);

    // Validate data and calculate rewards
    const validation = await this.validateData(data, device);
    
    // Update device status
    device.last_ping = new Date().toISOString();
    device.status = 'online';

    return validation;
  }

  private async verifyDeviceSignature(data: IoTData): Promise<boolean> {
    // In production, this would verify the cryptographic signature
    // For now, we'll do basic validation
    return data.signature && data.signature.length > 10;
  }

  private updateDeviceMetrics(device: DePINDevice, data: IoTData): void {
    device.metrics.total_scans++;
    device.metrics.total_weight += data.data.weight;
    
    if (data.data.contamination_score < 0.3) {
      device.metrics.contamination_detections++;
    }

    // Calculate uptime (simplified)
    const hoursSinceLastPing = (Date.now() - new Date(device.last_ping).getTime()) / (1000 * 60 * 60);
    device.metrics.uptime_percentage = Math.max(0, Math.min(100, 100 - hoursSinceLastPing));
  }

  private async validateData(data: IoTData, device: DePINDevice): Promise<ValidationResult> {
    const baseReward = this.calculateBaseReward(data.data.weight, data.data.item_type);
    
    // Calculate multipliers
    const contaminationBonus = data.data.contamination_score < 0.2 ? 1.5 : 1.0;
    const locationBonus = this.getLocationBonus(device.location);
    const streakBonus = 1.0; // Would be calculated based on user streak
    
    const totalMultiplier = contaminationBonus * locationBonus * streakBonus;
    const rewardAmount = baseReward * totalMultiplier;

    // AI classification confidence
    const confidence = this.calculateConfidence(data);

    return {
      valid: confidence > 0.7,
      confidence,
      reward_amount: rewardAmount,
      multipliers: {
        contamination_bonus: contaminationBonus,
        streak_bonus: streakBonus,
        location_bonus: locationBonus,
      },
      metadata: {
        ai_classification: data.data.item_type,
        weight_verified: data.data.weight > 0,
        location_verified: true,
        device_trusted: device.status === 'online',
      }
    };
  }

  private calculateBaseReward(weight: number, itemType: string): number {
    const baseRates = {
      'PET': 0.1,
      'HDPE': 0.08,
      'PVC': 0.05,
      'LDPE': 0.07,
      'PP': 0.09,
      'PS': 0.06,
      'OTHER': 0.05
    };

    const rate = baseRates[itemType as keyof typeof baseRates] || 0.05;
    return weight * rate * 10; // PLY tokens per gram
  }

  private getLocationBonus(location: { lat: number; lng: number }): number {
    // Bonus for recycling in high-need areas
    // This would be based on real geographic data
    return 1.0 + (Math.random() * 0.3); // 0-30% bonus
  }

  private calculateConfidence(data: IoTData): number {
    let confidence = 0.8; // Base confidence
    
    // Reduce confidence based on contamination
    if (data.data.contamination_score > 0.5) {
      confidence -= 0.2;
    }
    
    // Increase confidence if we have image data
    if (data.data.image_hash) {
      confidence += 0.1;
    }
    
    // Weight validation
    if (data.data.weight <= 0) {
      confidence -= 0.3;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  async getDeviceStatus(deviceId: string): Promise<DePINDevice | null> {
    return this.devices.get(deviceId) || null;
  }

  async getAllDevices(): Promise<DePINDevice[]> {
    return Array.from(this.devices.values());
  }

  async updateDeviceStatus(deviceId: string, status: DePINDevice['status']): Promise<void> {
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = status;
      device.last_ping = new Date().toISOString();
    }
  }

  // Mock device simulator for testing
  async simulateSmartBin(location: { lat: number; lng: number; address: string }): Promise<string> {
    return await this.registerDevice({
      type: 'smart_bin',
      location,
      status: 'online',
      last_ping: new Date().toISOString(),
      firmware_version: '1.2.0',
      battery_level: 85,
      uptime: 86400 * 30, // 30 days
      metrics: {
        total_scans: 0,
        total_weight: 0,
        contamination_detections: 0,
        uptime_percentage: 100,
        rewards_distributed: 0,
        last_maintenance: new Date().toISOString(),
      },
      node_address: `node_${Math.random().toString(36).substr(2, 9)}`
    });
  }

  // Generate mock IoT data for testing
  generateMockIoTData(deviceId: string): IoTData {
    const itemTypes = ['PET', 'HDPE', 'PVC', 'LDPE', 'PP', 'PS'];
    const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    
    return {
      device_id: deviceId,
      timestamp: new Date().toISOString(),
      data: {
        weight: Math.random() * 50 + 10, // 10-60 grams
        contamination_score: Math.random() * 0.3, // 0-30% contamination
        item_type: randomType,
        image_hash: `img_${Math.random().toString(36).substr(2, 16)}`,
        qr_code: `QR_${Math.random().toString(36).substr(2, 8)}`,
        temperature: 20 + Math.random() * 15, // 20-35°C
        humidity: 40 + Math.random() * 40, // 40-80%
        bin_capacity: 60 + Math.random() * 30, // 60-90% full
      },
      signature: `sig_${Math.random().toString(36).substr(2, 32)}`
    };
  }
}

export const depinHardware = new DePINHardwareManager();