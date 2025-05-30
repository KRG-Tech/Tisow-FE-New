import dayjs from 'dayjs';

export function formatTimestamp(timestamp: number): string {
  return dayjs.unix(timestamp).format('DD/MM/YYYY h:mm:ss A');
}
