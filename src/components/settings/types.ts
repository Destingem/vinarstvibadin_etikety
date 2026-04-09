"use client";

export interface MembershipStatusData {
  hasMembership: boolean;
  membership?: {
    plan: string;
    wineLimit?: number;
    currentWineCount?: number;
    expiresAt: string;
    isActive: boolean;
    isExpired: boolean;
    resetYear?: number;
  };
  canCreateWines: boolean;
  currentCount: number;
  limit: number;
  yearlyLimit?: number;
  yearsSinceStart?: number;
  message: string;
}

export interface ApiUsageSummary {
  summary: {
    totalRequests: number;
    successfulRequests: number;
    errorRequests: number;
    successRate: string;
    averageResponseTime: number;
    range: string;
  };
  endpoints: Array<{
    endpoint: string;
    count: number;
    successCount: number;
    errorCount: number;
    averageResponseTime: number;
  }>;
}

const PLAN_META = {
  STANDARD: {
    label: "Standard",
    price: "690 Kč / rok",
    description: "Do 20 sarzi rocne",
  },
  PLUS: {
    label: "Plus",
    price: "1 490 Kč / rok",
    description: "Do 50 sarzi rocne",
  },
  "NEOMEZENĚ": {
    label: "Neomezene",
    price: "6 990 Kč / rok",
    description: "Neomezene sarze, API a analytika",
  },
  ENTERPRISE: {
    label: "Enterprise",
    price: "Na dotaz",
    description: "Individualni provoz a SLA",
  },
} as const;

export function getPlanMeta(plan?: string) {
  if (!plan || !(plan in PLAN_META)) {
    return {
      label: "Bez aktivniho tarifu",
      price: "Kontaktujte nas",
      description: "Pristup a tarif resime individualne.",
    };
  }

  return PLAN_META[plan as keyof typeof PLAN_META];
}

export function hasPremiumAccess(plan?: string) {
  return plan === "NEOMEZENĚ" || plan === "ENTERPRISE";
}

export function getRemainingWineCapacity(status: MembershipStatusData | null) {
  if (!status?.hasMembership) {
    return "0";
  }

  if (status.limit === -1) {
    return "Neomezene";
  }

  return String(Math.max(status.limit - status.currentCount, 0));
}

export function getUsageLabel(status: MembershipStatusData | null) {
  if (!status?.hasMembership) {
    return "0 / 0";
  }

  return `${status.currentCount} / ${status.limit === -1 ? "∞" : status.limit}`;
}
