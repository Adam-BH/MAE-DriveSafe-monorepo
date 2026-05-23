import { useState, useRef, useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as Location from 'expo-location';
import { api } from '../lib/api';
import { computeLiveScore, scoreBreakdown, SessionState } from '../lib/scoring';
import { THRESHOLDS } from '../constants/scoring';

export interface LiveMetrics {
  score: number;
  speedKmh: number;
  durationSec: number;
  distanceKm: number;
  phoneUseSec: number;
  phonePickups: number;
  harshBrakes: number;
  sharpCorners: number;
  phoneWarning: boolean;
}

export interface SessionEvent {
  occurred_at: string;
  event_type: string;
  severity?: 'low' | 'medium' | 'high';
  value?: number;
  lat?: number;
  lng?: number;
  metadata?: Record<string, unknown>;
}

type SessionStatus = 'idle' | 'starting' | 'recording' | 'ending' | 'done' | 'error';

export function useSession() {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<LiveMetrics>({
    score: 100, speedKmh: 0, durationSec: 0, distanceKm: 0,
    phoneUseSec: 0, phonePickups: 0, harshBrakes: 0, sharpCorners: 0, phoneWarning: false,
  });
  const [finalSummary, setFinalSummary] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const stateRef = useRef<SessionState>({
    phonePickups: 0, phoneUseSec: 0, harshBrakes: 0, harshAccels: 0,
    sharpCorners: 0, speedingKm: 0, totalKm: 0, hasNightDriving: false,
    durationSec: 0, weeklyHours: 0,
  });
  const eventsRef = useRef<SessionEvent[]>([]);
  const gpsTraceRef = useRef<Array<{ lat: number; lng: number; speed_kmh: number; ts: string }>>([]);
  const startTimeRef = useRef<Date | null>(null);
  const lastPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const phoneUseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const accelSubRef = useRef<{ remove: () => void } | null>(null);
  const gyroSubRef = useRef<{ remove: () => void } | null>(null);
  const appStateRef = useRef<AppStateStatus>('active');
  const currentSpeedRef = useRef(0);
  const startedAt = useRef('');

  const addEvent = (e: SessionEvent) => eventsRef.current.push(e);

  const startSession = useCallback(async () => {
    setStatus('starting');
    setErrorMsg('');
    try {
      const { status: locPerm } = await Location.requestForegroundPermissionsAsync();
      if (locPerm !== 'granted') throw new Error('Location permission denied');

      startedAt.current = new Date().toISOString();
      const { data } = await api.post('/sessions', {
        started_at: startedAt.current,
        device_platform: 'ios',
        app_version: '1.0.0',
      });
      setSessionId(data.id);
      startTimeRef.current = new Date();

      Accelerometer.setUpdateInterval(20);
      accelSubRef.current = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const ts = new Date().toISOString();
        const s = stateRef.current;
        const pos = lastPosRef.current;

        if (Math.abs(z) > THRESHOLDS.harshBrakeG && magnitude > 1.2) {
          s.harshBrakes++;
          addEvent({ occurred_at: ts, event_type: 'harsh_brake', severity: 'medium', value: Math.abs(z), lat: pos?.lat, lng: pos?.lng });
        } else if (magnitude > 1.3) {
          s.harshAccels++;
          addEvent({ occurred_at: ts, event_type: 'harsh_acceleration', severity: 'low', value: magnitude, lat: pos?.lat, lng: pos?.lng });
        }
      });

      Gyroscope.setUpdateInterval(50);
      gyroSubRef.current = Gyroscope.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        if (magnitude > 2.5) {
          const ts = new Date().toISOString();
          stateRef.current.sharpCorners++;
          addEvent({ occurred_at: ts, event_type: 'sharp_corner', severity: 'low', value: magnitude });
        }
        const tiltAngle = Math.abs(x) * (180 / Math.PI);
        if (tiltAngle > THRESHOLDS.sharpCornerDeg && currentSpeedRef.current > THRESHOLDS.phoneUseSpeedKmh) {
          const ts = new Date().toISOString();
          stateRef.current.phonePickups++;
          addEvent({ occurred_at: ts, event_type: 'phone_pickup', severity: 'high' });
        }
      });

      locationSubRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 10 },
        (loc) => {
          const { latitude: lat, longitude: lng, speed } = loc.coords;
          const speedKmh = Math.max(0, (speed ?? 0) * 3.6);
          currentSpeedRef.current = speedKmh;
          const ts = new Date(loc.timestamp).toISOString();

          gpsTraceRef.current.push({ lat, lng, speed_kmh: speedKmh, ts });

          if (lastPosRef.current) {
            const dist = haversine(lastPosRef.current.lat, lastPosRef.current.lng, lat, lng);
            stateRef.current.totalKm += dist;
          }
          lastPosRef.current = { lat, lng };

          const hour = new Date().getHours();
          if (hour < 6 || hour >= 22) stateRef.current.hasNightDriving = true;
        }
      );

      const appStateSub = AppState.addEventListener('change', (nextState) => {
        const speed = currentSpeedRef.current;
        if (nextState === 'background' && speed > THRESHOLDS.phoneUseSpeedKmh) {
          const ts = new Date().toISOString();
          addEvent({ occurred_at: ts, event_type: 'phone_in_use', severity: 'high' });
          phoneUseTimerRef.current = setInterval(() => {
            stateRef.current.phoneUseSec++;
          }, 1000);
        } else if (nextState === 'active') {
          if (phoneUseTimerRef.current) {
            clearInterval(phoneUseTimerRef.current);
            phoneUseTimerRef.current = null;
          }
        }
        appStateRef.current = nextState;
      });

      tickRef.current = setInterval(() => {
        const elapsed = startTimeRef.current
          ? Math.round((Date.now() - startTimeRef.current.getTime()) / 1000)
          : 0;
        stateRef.current.durationSec = elapsed;
        const s = stateRef.current;
        const score = computeLiveScore(s);

        setMetrics({
          score,
          speedKmh: Math.round(currentSpeedRef.current),
          durationSec: elapsed,
          distanceKm: Math.round(s.totalKm * 100) / 100,
          phoneUseSec: s.phoneUseSec,
          phonePickups: s.phonePickups,
          harshBrakes: s.harshBrakes,
          sharpCorners: s.sharpCorners,
          phoneWarning: appStateRef.current === 'background' && currentSpeedRef.current > THRESHOLDS.phoneUseSpeedKmh,
        });
      }, 1000);

      setStatus('recording');
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Failed to start session');
      setStatus('error');
    }
  }, []);

  const endSession = useCallback(async () => {
    if (!sessionId) return;
    setStatus('ending');

    if (tickRef.current) clearInterval(tickRef.current);
    if (phoneUseTimerRef.current) clearInterval(phoneUseTimerRef.current);
    accelSubRef.current?.remove();
    gyroSubRef.current?.remove();
    locationSubRef.current?.remove();

    try {
      const endedAt = new Date().toISOString();
      const s = stateRef.current;
      const breakdown = scoreBreakdown(s);
      const tripScore = computeLiveScore(s);

      if (eventsRef.current.length > 0) {
        await api.post(`/sessions/${sessionId}/events`, { events: eventsRef.current });
      }

      const lastGps = gpsTraceRef.current[gpsTraceRef.current.length - 1];
      const firstGps = gpsTraceRef.current[0];
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 22 ? 'evening' : 'night';

      await api.patch(`/sessions/${sessionId}`, {
        ended_at: endedAt,
        distance_km: s.totalKm,
        route_type: 'mixed',
        time_of_day: timeOfDay,
        gps_trace: gpsTraceRef.current,
        score_breakdown: breakdown,
        trip_score: tripScore,
        ...(firstGps ? { start_lat: firstGps.lat, start_lng: firstGps.lng } : {}),
        ...(lastGps ? { end_lat: lastGps.lat, end_lng: lastGps.lng } : {}),
      });

      setFinalSummary({
        sessionId,
        tripScore,
        breakdown,
        distanceKm: s.totalKm,
        durationSec: s.durationSec,
        phoneUseSec: s.phoneUseSec,
        phonePickups: s.phonePickups,
        harshBrakes: s.harshBrakes,
        sharpCorners: s.sharpCorners,
      });

      setStatus('done');
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Failed to save session');
      setStatus('error');
    }
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (phoneUseTimerRef.current) clearInterval(phoneUseTimerRef.current);
      accelSubRef.current?.remove();
      gyroSubRef.current?.remove();
      locationSubRef.current?.remove();
    };
  }, []);

  return { status, metrics, finalSummary, errorMsg, startSession, endSession };
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
