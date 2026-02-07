// Health check related type definitions

import type { ServiceStatus } from "./service";

export interface HealthCheck {
	id: string;
	serviceId: string;
	status: ServiceStatus;
	responseTime?: number; // milliseconds
	statusCode?: number;
	error?: string;
	checkedAt: string;
}

export interface HealthCheckResult {
	status: ServiceStatus;
	responseTime?: number;
	statusCode?: number;
	error?: string;
}

export interface ServiceHealth {
	serviceId: string;
	serviceName: string;
	currentStatus: ServiceStatus;
	lastCheck?: HealthCheck;
	recentChecks: HealthCheck[];
	uptimePercentage?: number;
	averageResponseTime?: number;
}
