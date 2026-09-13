import { apiRequest } from "./api-client";
import type { NotificationDTO, Paginated } from "@nodara/shared";

export const notificationService = {
  list: (page = 1, pageSize = 20) =>
    apiRequest<Paginated<NotificationDTO>>(`/api/notifications?page=${page}&pageSize=${pageSize}`),

  markRead: (id: string) => apiRequest<NotificationDTO>(`/api/notifications/${id}/read`, { method: "PATCH" }),
};
