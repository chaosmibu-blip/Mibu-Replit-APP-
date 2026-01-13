/**
 * 通知相關類型
 */

export interface NotificationStatus {
  itembox: number;
  collection: number;
}

export interface UnreadCounts {
  unread: {
    collection: number;
    itembox: number;
    announcement: number;
  };
  total: number;
}
