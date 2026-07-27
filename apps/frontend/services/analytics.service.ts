import { apiRequest } from "./api-client";
import type { AnalyticsSummaryDTO } from "@nodara/shared";

export const analyticsService = {
  getSummary: () => apiRequest<AnalyticsSummaryDTO>("/api/analytics/summary"),
};
