
export interface SpeedResult {
  download: number; // Mbps
  upload: number; // Mbps
  ping: number; // ms
  jitter: number; // ms
  timestamp: number;
}

export interface WifiResult {
  linkSpeed: number; // Mbps
  signalStrength: number; // dBm (simulated)
  channel: number;
  localLatency: number; // ms
  timestamp: number;
}

export interface AIAnalysis {
  status: 'excellent' | 'good' | 'average' | 'poor';
  recommendations: string[];
  explanation: string;
}

export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  type: 'hotspot' | 'tower' | 'cafe';
  description: string;
}

export type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'analyzing' | 'complete' | 'measuring-wifi';
export type AppView = 'internet' | 'wifi' | 'coverage';
