// src/hooks/useProgressPolling.ts
// import { useEffect, useState, useRef } from "react";
// import { useDispatch } from "react-redux";
// import { fetchProgress } from "../slices/devices/thunk";
// import type { ProgressStatus } from "../types/Devices";
// import type { AppDispatch } from "../slices";


// interface UseProgressPollingOptions {
//   refetchInterval?: number; // in ms
//   refetchIntervalBackground?: boolean;
// }

// export const useProgressPolling = ({
//   refetchInterval = 3000,
//   refetchIntervalBackground = false,
// }: UseProgressPollingOptions = {}) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const [progress, setProgress] = useState<ProgressStatus | null>(null);
//   const [isComplete, setIsComplete] = useState(false);
//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


//   useEffect(() => {
//     const poll = async () => {
//       try {
//         const action = await dispatch(fetchProgress());
//         if (fetchProgress.fulfilled.match(action)) {
//           const data = action.payload;
//           setProgress(data);

//           if (data.processed >= data.total) {
//             setIsComplete(true);
//             if (intervalRef.current) clearInterval(intervalRef.current);
//           }
//         }
//       } catch (err) {
//         console.error("Polling error", err);
//       }
//     };

//      Start polling
//     poll();
//     intervalRef.current = setInterval(poll, refetchInterval);

//      Stop polling when component unmounts or completed
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [dispatch, refetchInterval, refetchIntervalBackground]);

//   return { progress, isComplete };
// };


// interface UseProgressPollingOptions {
//   refetchInterval?: number;
// }

// export const useProgressPolling = ({ refetchInterval = 3000 }: UseProgressPollingOptions = {}) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const [progress, setProgress] = useState<ProgressStatus | null>(null);
//   const [isComplete, setIsComplete] = useState(false);

//     const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const isFetchingRef = useRef(false);
//   const errorCountRef = useRef(0);

//   useEffect(() => {
//     const poll = async () => {
//       if (isFetchingRef.current) return;
//       isFetchingRef.current = true;

//       try {
//         const action = await dispatch(fetchProgress());
//         if (fetchProgress.fulfilled.match(action)) {
//           const data = action.payload;
//           setProgress(data);
//           errorCountRef.current = 0;

//           if (data.processed >= data.total && data.total > 0) {
//             setIsComplete(true);
//             if (intervalRef.current) clearInterval(intervalRef.current);
//           }
//         } else {
//           errorCountRef.current++;
//         }
//       } catch {
//         errorCountRef.current++;
//       } finally {
//         isFetchingRef.current = false;
//       }
//     };

//     poll();
//     intervalRef.current = setInterval(poll, refetchInterval);

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [dispatch, refetchInterval]);

//   return { progress, isComplete };
// };


import { useState, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchProgress } from "../slices/devices/thunk";
import type { AppDispatch } from "../slices";
import type { ProgressStatus } from "../types/Devices";

interface UseProgressPollingOptions {
  refetchInterval?: number;
}

export const useProgressPolling = ({
  refetchInterval = 3000,
}: UseProgressPollingOptions = {}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [progress, setProgress] = useState<ProgressStatus | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFetchingRef = useRef(false);

  // 🟢 Start polling manually
  const startPolling = useCallback(async () => {
    if (isPolling) return;
    setIsPolling(true);

    const poll = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        const action = await dispatch(fetchProgress());
        if (fetchProgress.fulfilled.match(action)) {
          const data = action.payload as ProgressStatus;
          setProgress(data);

          // ✅ Stop polling when complete
          if (data.total > 0 && data.processed >= data.total) {
            setIsComplete(true);
            stopPolling();
          }
        }
      } finally {
        isFetchingRef.current = false;
      }
    };

    // Run immediately once
    await poll();

    // Then every few seconds
    intervalRef.current = setInterval(poll, refetchInterval);
  }, [dispatch, refetchInterval, isPolling]);

  //Stop polling manually
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  return { progress, isComplete, startPolling, stopPolling, isPolling };
};

