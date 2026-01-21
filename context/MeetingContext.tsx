import { MOCK_MEETINGS, calculateDistance, generateSimpleRoute } from '@/data/meetings';
import { Coordinates, Meeting, Participant } from '@/types/meeting';
import * as Location from 'expo-location';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface MeetingContextType {
  meetings: Meeting[];
  activeMeeting: Meeting | null;
  userLocation: Coordinates | null;
  locationPermission: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  setActiveMeeting: (meeting: Meeting | null) => void;
  updateParticipantLocation: (meetingId: string, participantId: string, location: Coordinates) => void;
  checkInToMeeting: (meetingId: string) => Promise<boolean>;
  refreshLocation: () => Promise<void>;
  getMeetingById: (id: string) => Meeting | undefined;
  getParticipantRoute: (participant: Participant, destination: Coordinates) => Coordinates[];
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export function MeetingProvider({ children }: { children: React.ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>(MOCK_MEETINGS);
  const [activeMeeting, setActiveMeetingState] = useState<Meeting | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Request location permission and get initial location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');

        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
      } catch (err) {
        setError('Không thể lấy vị trí: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Watch location updates when there's an active meeting
  useEffect(() => {
    if (!activeMeeting || !locationPermission) return;

    const subscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // Update every 10 seconds
        distanceInterval: 50 // or when moved 50 meters
      },
      (location) => {
        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        setUserLocation(newLocation);
        
        // Auto-update user's participant location in active meeting
        // (In real app, you'd identify current user's participant ID)
      }
    );

    return () => {
      subscription.then(sub => sub.remove());
    };
  }, [activeMeeting, locationPermission]);

  const setActiveMeeting = useCallback((meeting: Meeting | null) => {
    setActiveMeetingState(meeting);
  }, []);

  const updateParticipantLocation = useCallback(
    (meetingId: string, participantId: string, location: Coordinates) => {
      setMeetings(prevMeetings =>
        prevMeetings.map(meeting => {
          if (meeting.id !== meetingId) return meeting;

          return {
            ...meeting,
            participants: meeting.participants.map(participant => {
              if (participant.id !== participantId) return participant;

              // Calculate distance to meeting location
              const distance = calculateDistance(location, meeting.location);

              // Update ETA based on distance (rough estimate: 30 km/h average speed)
              const estimatedMinutes = Math.ceil((distance / 30) * 60);
              const estimatedArrival = new Date(Date.now() + estimatedMinutes * 60 * 1000).toISOString();

              // Auto-update status based on distance
              let status = participant.status;
              if (distance < 0.1) {
                status = 'arrived';
              } else if (distance < 10 && status === 'not-started') {
                status = 'on-the-way';
              }

              return {
                ...participant,
                currentLocation: location,
                distance: parseFloat(distance.toFixed(2)),
                estimatedArrival,
                status
              };
            })
          };
        })
      );
    },
    []
  );

  const checkInToMeeting = useCallback(
    async (meetingId: string): Promise<boolean> => {
      if (!userLocation) {
        setError('Không xác định được vị trí của bạn');
        return false;
      }

      const meeting = meetings.find(m => m.id === meetingId);
      if (!meeting) {
        setError('Không tìm thấy cuộc họp');
        return false;
      }

      const distance = calculateDistance(userLocation, meeting.location);
      const distanceInMeters = distance * 1000;

      if (meeting.checkInRequired && meeting.checkInRadius) {
        if (distanceInMeters > meeting.checkInRadius) {
          setError(`Bạn phải ở trong bán kính ${meeting.checkInRadius}m để check-in`);
          return false;
        }
      }

      // Success - update meeting status
      setMeetings(prevMeetings =>
        prevMeetings.map(m =>
          m.id === meetingId
            ? { ...m, status: 'in-progress' as const }
            : m
        )
      );

      return true;
    },
    [userLocation, meetings]
  );

  const refreshLocation = useCallback(async () => {
    if (!locationPermission) return;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      setError(null);
    } catch (err) {
      setError('Không thể cập nhật vị trí: ' + (err as Error).message);
    }
  }, [locationPermission]);

  const getMeetingById = useCallback(
    (id: string) => meetings.find(m => m.id === id),
    [meetings]
  );

  const getParticipantRoute = useCallback(
    (participant: Participant, destination: Coordinates): Coordinates[] => {
      if (!participant.currentLocation) return [];
      return generateSimpleRoute(participant.currentLocation, destination);
    },
    []
  );

  const value: MeetingContextType = {
    meetings,
    activeMeeting,
    userLocation,
    locationPermission,
    loading,
    error,
    setActiveMeeting,
    updateParticipantLocation,
    checkInToMeeting,
    refreshLocation,
    getMeetingById,
    getParticipantRoute
  };

  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeeting() {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within MeetingProvider');
  }
  return context;
}
