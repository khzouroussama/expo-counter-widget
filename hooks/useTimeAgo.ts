import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useInterval } from './useInterval';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

const useTimeAgo = (isoDate: string | null) => {
  const [timeAgo, setTimeAgo] = useState('');

  const formatTimeAgo = () => {
    const now = dayjs();
    const date = dayjs(isoDate);
    const diff = now.diff(date);
    const duration = dayjs.duration(diff);

    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    const parts = [];
    if (hours === 0 && minutes === 0 && seconds === 0) return 'Updated just now';
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return `Updated ${parts.join(' ')} ago`;
  };

  useInterval(() => {
    // Initial update
    setTimeAgo(formatTimeAgo());
  }, 1000);

  useEffect(() => {
    setTimeAgo(formatTimeAgo());
  }, []);

  return timeAgo ?? 'N/A';
};

export default useTimeAgo;
