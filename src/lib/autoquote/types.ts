export interface AutoQuoteMaterial {
  code: string;
  display_name: string;
  processes: string[];
}

export interface MaterialsResponse {
  updated_at: string;
  rate_card_version: string;
  materials: AutoQuoteMaterial[];
}

export interface QuoteSubmitResponse {
  quote_id: string;
  bridge_request_id: string;
  shop_id: string;
  status: "pending";
  quote_url: string;
}

export type QuoteStatus =
  | "DRAFT"
  | "OFFERED"
  | "ACCEPTED"
  | "REJECTED"
  | "NEEDS_REVIEW"
  | "EXPIRED";

export type BehaviorGate = "GREEN" | "YELLOW" | "RED" | null;

export interface DfmIssue {
  code: string;
  severity: string;
  message: string;
}

export interface QuoteResponse {
  id: string;
  status: QuoteStatus;
  behavior_gate: BehaviorGate;
  buyable: boolean;
  unit_price_usd: string | null;
  total_price_usd: string | null;
  lead_time_days: number | null;
  confidence: number | null;
  dfm_issues: DfmIssue[];
  cost_breakdown: Record<string, unknown> | null;
  routing: Array<{ process: string; [key: string]: unknown }>;
}

export interface AutoQuoteError {
  detail: string;
}
