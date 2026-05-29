import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

/* ─── Enums ─── */

export const fitmentStatusEnum = pgEnum("fitment_status", [
  "verified",
  "scan_verified",
  "reference",
]);

export const tierEnum = pgEnum("tier", [
  "oem",
  "improved",
  "custom",
  "fitment_check",
]);

export const safetyClassEnum = pgEnum("safety_class", [
  "cosmetic",
  "functional",
  "critical_excluded",
]);

export const segmentEnum = pgEnum("segment", [
  "tractor",
  "marine",
  "automotive",
  "motorcycle",
  "industrial",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending_quote",
  "quoted",
  "paid",
  "queued",
  "in_progress",
  "qc",
  "shipped",
  "delivered",
  "cancelled",
]);

export const quoteStatusEnum = pgEnum("quote_status", [
  "draft",
  "pending",
  "offered",
  "needs_review",
  "accepted",
  "rejected",
  "expired",
]);

/* ─── Parts Library ─── */

export const parts = pgTable("parts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  segment: segmentEnum("segment").notNull(),
  make: text("make"),
  model: text("model"),
  yearStart: integer("year_start"),
  yearEnd: integer("year_end"),
  application: text("application").notNull(),
  description: text("description"),
  fitmentStatus: fitmentStatusEnum("fitment_status")
    .notNull()
    .default("reference"),
  safetyClass: safetyClassEnum("safety_class")
    .notNull()
    .default("cosmetic"),
  dimensions: text("dimensions"),
  partNumber: text("part_number"),
  scanDate: timestamp("scan_date"),
  scanSource: text("scan_source"),
  cadFileUrl: text("cad_file_url"),
  stlPreviewUrl: text("stl_preview_url"),
  contributorId: uuid("contributor_id").references(() => contributors.id),
  scanQueueId: uuid("scan_queue_id"),
  lastEstimatePrice: decimal("last_estimate_price", { precision: 10, scale: 2 }),
  lastEstimateAt: timestamp("last_estimate_at"),
  lastEstimateMaterial: text("last_estimate_material"),
  notes: text("notes"),
  active: boolean("active").notNull().default(true),
  timesSold: integer("times_sold").default(0),
  timesViewed: integer("times_viewed").default(0),
  customQuotes: jsonb("custom_quotes").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/* ─── Part Variants (material tiers) ─── */

export const partVariants = pgTable("part_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  partId: uuid("part_id")
    .notNull()
    .references(() => parts.id, { onDelete: "cascade" }),
  tier: tierEnum("tier").notNull(),
  material: text("material").notNull(),
  process: text("process").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  leadTimeDays: integer("lead_time_days"),
  autoquoteMaterialCode: text("autoquote_material_code"),
  autoquoteProcess: text("autoquote_process"),
  lastQuotedPrice: decimal("last_quoted_price", { precision: 10, scale: 2 }),
  lastQuotedAt: timestamp("last_quoted_at"),
  lastQuoteId: text("last_quote_id"),
  lastQuoteExpiresAt: timestamp("last_quote_expires_at"),
  lastQuoteFirm: boolean("last_quote_firm").default(false),
  available: boolean("available").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ─── Manufacturing Packages ─── */

export const manufacturingPackages = pgTable("manufacturing_packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => partVariants.id, { onDelete: "cascade" }),
  version: text("version").notNull(),
  approvedForProduction: boolean("approved_for_production")
    .notNull()
    .default(false),
  releasedAt: timestamp("released_at"),
  releasedBy: text("released_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ─── Manufacturing Artifacts (files in a package) ─── */

export const manufacturingArtifacts = pgTable("manufacturing_artifacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  packageId: uuid("package_id")
    .notNull()
    .references(() => manufacturingPackages.id, { onDelete: "cascade" }),
  artifactType: text("artifact_type").notNull(),
  machineTarget: text("machine_target"),
  fileUrl: text("file_url").notNull(),
  checksum: text("checksum"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ─── Contributors ─── */

export const contributors = pgTable("contributors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  location: text("location"),
  publicCreditName: text("public_credit_name"),
  totalContributions: integer("total_contributions").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ─── Customers ─── */

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  isShopAccount: boolean("is_shop_account").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ─── Orders ─── */

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => customers.id),
  status: orderStatusEnum("status").notNull().default("pending_quote"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  rushOrder: boolean("rush_order").notNull().default(false),
  shippingMethod: text("shipping_method"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  shippedAt: timestamp("shipped_at"),
});

/* ─── Order Line Items ─── */

export const orderLineItems = pgTable("order_line_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => partVariants.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  autoquoteQuoteId: text("autoquote_quote_id"),
  status: orderStatusEnum("status").notNull().default("pending_quote"),
  notes: text("notes"),
});

/* ─── AutoQuote Cache ─── */

export const autoquoteCache = pgTable("autoquote_cache", {
  id: uuid("id").defaultRandom().primaryKey(),
  variantId: uuid("variant_id").references(() => partVariants.id),
  partId: uuid("part_id").references(() => parts.id),
  quoteId: text("quote_id").notNull(),
  status: quoteStatusEnum("quote_status").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  leadTimeDays: integer("lead_time_days"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  buyable: boolean("buyable"),
  dfmIssues: jsonb("dfm_issues"),
  costBreakdown: jsonb("cost_breakdown"),
  routing: jsonb("routing"),
  materialCode: text("material_code"),
  quantity: integer("quantity"),
  expiresAt: timestamp("expires_at"),
  quoteUrl: text("quote_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ─── Scan Queue (donor parts awaiting processing) ─── */

export const scanQueue = pgTable("scan_queue", {
  id: uuid("id").defaultRandom().primaryKey(),
  contributorId: uuid("contributor_id").references(() => contributors.id),
  partDescription: text("part_description").notNull(),
  application: text("application").notNull(),
  segment: segmentEnum("segment"),
  make: text("make"),
  model: text("model"),
  yearStart: integer("year_start"),
  yearEnd: integer("year_end"),
  fitmentStatus: fitmentStatusEnum("fitment_status").default("reference"),
  dimensions: text("dimensions"),
  partNumber: text("part_number"),
  condition: text("condition"),
  status: text("status").notNull().default("received"),
  photoUrls: jsonb("photo_urls"),
  partId: uuid("part_id").references(() => parts.id),
  notes: text("notes"),
  currentScanVersion: integer("current_scan_version").default(0),
  currentCadVersion: integer("current_cad_version").default(0),
  needsCadUpdate: boolean("needs_cad_update").notNull().default(false),
  receivedAt: timestamp("received_at").notNull().defaultNow(),
  scannedAt: timestamp("scanned_at"),
  completedAt: timestamp("completed_at"),
});

/* ─── Scan Artifacts (versioned files per scan queue item) ─── */

export const scanArtifactTypeEnum = pgEnum("scan_artifact_type", [
  "scan_raw",
  "scan_processed",
  "cad_model",
  "stl_preview",
  "drawing_pdf",
  "photo",
  "other",
]);

export const scanArtifacts = pgTable("scan_artifacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  scanQueueId: uuid("scan_queue_id")
    .notNull()
    .references(() => scanQueue.id, { onDelete: "cascade" }),
  artifactType: scanArtifactTypeEnum("artifact_type").notNull(),
  version: integer("version").notNull().default(1),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  supersededBy: uuid("superseded_by"),
  notes: text("notes"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

/* ─── Part Files (photos, CAD files, drawings per catalog part) ─── */

export const partFileTypeEnum = pgEnum("part_file_type", [
  "photo_donor",
  "photo_finished",
  "photo_mockup",
  "cad_step",
  "cad_fusion",
  "cad_solidworks",
  "cad_other",
  "stl_preview",
  "drawing_pdf",
  "scan_raw",
  "other",
]);

export const partFiles = pgTable("part_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  partId: uuid("part_id")
    .notNull()
    .references(() => parts.id, { onDelete: "cascade" }),
  fileType: partFileTypeEnum("file_type").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  displayOrder: integer("display_order").notNull().default(0),
  showInCatalog: boolean("show_in_catalog").notNull().default(false),
  isStepFile: boolean("is_step_file").notNull().default(false),
  thumbnailUrl: text("thumbnail_url"),
  tier: text("tier"),
  notes: text("notes"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

/* ─── Bounty Board (wanted part requests) ─── */

export const bountyBoard = pgTable("bounty_board", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  segment: segmentEnum("segment"),
  make: text("make"),
  model: text("model"),
  yearStart: integer("year_start"),
  yearEnd: integer("year_end"),
  reward: text("reward"),
  priority: text("priority").default("normal"),
  status: text("status").notNull().default("open"),
  claimedBy: uuid("claimed_by").references(() => contributors.id),
  claimedAt: timestamp("claimed_at"),
  fulfilledAt: timestamp("fulfilled_at"),
  partId: uuid("part_id").references(() => parts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
