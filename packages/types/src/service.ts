// Service-related type definitions

export type ServiceStatus = "up" | "down" | "degraded" | "unknown";

export interface Service {
  id: string;
  name: string;
  url: string;
  description?: string;
  checkInterval?: number; // milliseconds
  timeout?: number; // milliseconds
  dependencies?: string[]; // service IDs
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceInput {
  name: string;
  url: string;
  description?: string;
  checkInterval?: number;
  timeout?: number;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateServiceInput {
  name?: string;
  url?: string;
  description?: string;
  checkInterval?: number;
  timeout?: number;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}
