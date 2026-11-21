import axios from 'axios';
import { Incident, IncidentUpdate, IncidentConfirmation, DuplicateSuggestion, RiskAssessment, WeatherData, NotificationItem } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Incidents
  getIncidents: async (params?: {
    category?: string;
    status?: string;
    locality?: string;
    search?: string;
    severity?: number;
    min_priority?: number;
  }): Promise<Incident[]> => {
    const res = await apiClient.get<Incident[]>('/incidents', { params });
    return res.data;
  },

  getIncidentDetail: async (id: number): Promise<{
    incident: Incident;
    updates: IncidentUpdate[];
    confirmations: IncidentConfirmation[];
    duplicate_suggestions: DuplicateSuggestion[];
  }> => {
    const res = await apiClient.get(`/incidents/${id}`);
    return res.data;
  },

  createIncident: async (data: {
    title: string;
    description: string;
    category: string;
    severity?: number;
    urgency?: string;
    latitude: number;
    longitude: number;
    locality_name: string;
    landmark?: string;
    address?: string;
    photo_url?: string;
    is_anonymous?: boolean;
    language?: string;
    voice_transcript?: string;
  }): Promise<Incident> => {
    const res = await apiClient.post<Incident>('/incidents', data);
    return res.data;
  },

  updateIncidentStatus: async (
    id: number,
    data: {
      status: string;
      notes?: string;
      photo_url?: string;
      assigned_department?: string;
      assigned_to?: string;
    },
    userName?: string,
    userRole?: string
  ) => {
    const res = await apiClient.patch(`/incidents/${id}/status`, data, {
      params: { user_name: userName, user_role: userRole },
    });
    return res.data;
  },

  updateIncidentPriority: async (
    id: number,
    priority_score: number,
    reason?: string
  ) => {
    const res = await apiClient.patch(`/incidents/${id}/priority`, { priority_score, reason });
    return res.data;
  },

  confirmIncident: async (
    id: number,
    data: { notes?: string; photo_url?: string; still_present: boolean }
  ) => {
    const res = await apiClient.post(`/incidents/${id}/confirm`, data);
    return res.data;
  },

  // AI Services
  classifyText: async (data: {
    description: string;
    title?: string;
    image_url?: string;
    language?: string;
  }) => {
    const res = await apiClient.post('/ai/classify', data);
    return res.data;
  },

  getDuplicates: async (): Promise<DuplicateSuggestion[]> => {
    const res = await apiClient.get<DuplicateSuggestion[]>('/ai/duplicates');
    return res.data;
  },

  resolveDuplicate: async (data: {
    primary_incident_id: number;
    duplicate_incident_id: number;
    action: 'merge' | 'reject';
  }) => {
    const res = await apiClient.post('/ai/duplicates/resolve', data);
    return res.data;
  },

  getAISummary: async () => {
    const res = await apiClient.get('/ai/summary');
    return res.data;
  },

  // Weather Services
  getCurrentWeather: async (live: boolean = false): Promise<WeatherData> => {
    const res = await apiClient.get<WeatherData>('/weather/current', { params: { live } });
    return res.data;
  },

  setWeatherScenario: async (scenario: string, rainfall_mm?: number) => {
    const res = await apiClient.post('/weather/scenario', { scenario, rainfall_mm });
    return res.data;
  },

  // Analytics Services
  getAnalyticsOverview: async () => {
    const res = await apiClient.get('/analytics/overview');
    return res.data;
  },

  getRiskTimeline: async (): Promise<{
    locality_risks: RiskAssessment[];
    weather: WeatherData;
    timeline_events: any[];
  }> => {
    const res = await apiClient.get('/analytics/risk-timeline');
    return res.data;
  },

  getCommunityImpact: async () => {
    const res = await apiClient.get('/analytics/community-impact');
    return res.data;
  },

  getAuditLogs: async (limit: number = 50) => {
    const res = await apiClient.get('/analytics/audit-logs', { params: { limit } });
    return res.data;
  },

  // Demo Runner
  runDemoStep: async (step: number) => {
    const res = await apiClient.post('/demo/run-scenario', null, { params: { step } });
    return res.data;
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get<NotificationItem[]>('/notifications');
    return res.data;
  },

  markNotificationRead: async (id: number) => {
    const res = await apiClient.post(`/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsRead: async () => {
    const res = await apiClient.post('/notifications/read-all');
    return res.data;
  },

  // Auth / Quick Switch
  quickSwitchRole: async (role: string) => {
    const res = await apiClient.get(`/auth/quick-switch/${role}`);
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (userData: any) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  }
};
