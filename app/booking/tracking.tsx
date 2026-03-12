/**
 * Booking Tracking Screen — REDIRECT
 * This old screen has been unified into /service-booking/live-tracking.
 * Keeps the route alive for backward compatibility.
 */

import { Redirect, useLocalSearchParams } from "expo-router";

export default function TrackingRedirect() {
  const params = useLocalSearchParams();

  return (
    <Redirect
      href={
        {
          pathname: "/service-booking/live-tracking",
          params: {
            bookingId: params.bookingId as string,
            workerId: params.workerId as string,
            workerName: params.workerName as string,
            category: params.serviceId as string,
          },
        } as any
      }
    />
  );
}
