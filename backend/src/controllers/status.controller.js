import { getSystemStatus } from '../services/status.service.js';

export function getStatus(req, res) {
  const status = getSystemStatus();
  res.json(status);
}