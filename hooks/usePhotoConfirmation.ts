/**
 * usePhotoConfirmation Hook
 * Captures or picks a photo for confirmation, attaches geolocation and metadata.
 * Returns payload ready for upload and confirmation submission.
 *
 * @created 2026-03-16 — Round 4 workflow standardization
 */

import type { PhotoConfirmationPayload } from "@/types/workflow";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useCallback, useState } from "react";

export interface UsePhotoConfirmationResult {
  payload: PhotoConfirmationPayload | null;
  isCapturing: boolean;
  error: string | null;
  capturePhoto: () => Promise<PhotoConfirmationPayload | null>;
  pickPhoto: () => Promise<PhotoConfirmationPayload | null>;
  addNote: (note: string) => void;
  clear: () => void;
}

async function tryGetLocation(): Promise<
  PhotoConfirmationPayload["geolocation"] | undefined
> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return undefined;
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy ?? undefined,
    };
  } catch {
    return undefined;
  }
}

export function usePhotoConfirmation(): UsePhotoConfirmationResult {
  const [payload, setPayload] = useState<PhotoConfirmationPayload | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capturePhoto =
    useCallback(async (): Promise<PhotoConfirmationPayload | null> => {
      setIsCapturing(true);
      setError(null);

      try {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setError("Cần cấp quyền camera");
          return null;
        }

        const result = await ImagePicker.launchCameraAsync({
          quality: 0.85,
          exif: true,
        });

        if (result.canceled) {
          setIsCapturing(false);
          return null;
        }

        const asset = result.assets[0];
        const geo = await tryGetLocation();

        const data: PhotoConfirmationPayload = {
          imageUri: asset.uri,
          timestamp: new Date().toISOString(),
          geolocation: geo,
        };

        setPayload(data);
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Chụp ảnh thất bại";
        setError(msg);
        return null;
      } finally {
        setIsCapturing(false);
      }
    }, []);

  const pickPhoto =
    useCallback(async (): Promise<PhotoConfirmationPayload | null> => {
      setIsCapturing(true);
      setError(null);

      try {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          setError("Cần cấp quyền thư viện ảnh");
          return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.85,
        });

        if (result.canceled) {
          setIsCapturing(false);
          return null;
        }

        const asset = result.assets[0];

        const data: PhotoConfirmationPayload = {
          imageUri: asset.uri,
          timestamp: new Date().toISOString(),
        };

        setPayload(data);
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Chọn ảnh thất bại";
        setError(msg);
        return null;
      } finally {
        setIsCapturing(false);
      }
    }, []);

  const addNote = useCallback((note: string) => {
    setPayload((prev) => (prev ? { ...prev, note } : null));
  }, []);

  const clear = useCallback(() => {
    setPayload(null);
    setError(null);
  }, []);

  return {
    payload,
    isCapturing,
    error,
    capturePhoto,
    pickPhoto,
    addNote,
    clear,
  };
}
