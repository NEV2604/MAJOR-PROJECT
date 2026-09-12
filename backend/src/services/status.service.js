export function getSystemStatus() {
  return {
    status: 'operational',
    timestamp: new Date().toISOString(),
  };
}