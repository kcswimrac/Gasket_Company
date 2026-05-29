"use client";

import { useState, useEffect, useCallback } from "react";

interface MigrationStatus {
  tables: string[];
  migrations: {
    available: string[];
    applied: string[];
    pending: string[];
  };
}

interface MigrationResult {
  name: string;
  status: string;
  error?: string;
}

function MigrationsPanel() {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<MigrationResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/migrations");
      const data = await res.json();
      if (data.success) {
        setStatus(data);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const runMigration = async (migration?: string) => {
    setRunning(true);
    setResults(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/migrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(migration ? { migration } : { runAll: true }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results || []);
        if (data.message) setResults([{ name: "—", status: data.message }]);
        fetchStatus();
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to run");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <svg className="animate-spin w-4 h-4 text-charcoal-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-charcoal-400">Checking database...</span>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-sm font-medium text-red-400">Database Connection Error</span>
        </div>
        <p className="text-xs text-charcoal-400 font-mono bg-charcoal-950 rounded p-3 break-all">{error}</p>
        <button onClick={fetchStatus} className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-medium">Retry</button>
      </div>
    );
  }

  const hasNoTables = status && status.tables.length === 0;
  const hasPending = status && status.migrations.pending.length > 0;

  return (
    <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-charcoal-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${hasNoTables ? "bg-gold-400" : hasPending ? "bg-gold-400" : "bg-emerald-400"}`} />
          <h3 className="text-sm font-bold text-white">Database</h3>
          <span className="text-[10px] text-charcoal-500 font-mono">
            {status?.tables.length || 0} tables
          </span>
        </div>
        <button onClick={fetchStatus} className="text-[11px] text-charcoal-500 hover:text-charcoal-300 font-medium">
          Refresh
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Tables */}
        {status && status.tables.length > 0 && (
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase tracking-wider mb-2">Active Tables</p>
            <div className="flex flex-wrap gap-1.5">
              {status.tables.map((t) => (
                <span key={t} className="text-[11px] font-mono text-charcoal-300 bg-charcoal-800/50 px-2 py-0.5 rounded">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Applied migrations */}
        {status && status.migrations.applied.length > 0 && (
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase tracking-wider mb-2">Applied Migrations</p>
            {status.migrations.applied.map((m) => (
              <div key={m} className="flex items-center gap-2 py-1">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-mono text-charcoal-300">{m}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pending migrations */}
        {status && status.migrations.pending.length > 0 && (
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase tracking-wider mb-2">
              Pending Migrations ({status.migrations.pending.length})
            </p>
            <div className="space-y-2">
              {status.migrations.pending.map((m) => (
                <div key={m} className="flex items-center justify-between bg-charcoal-950/40 rounded-lg px-3 py-2 border border-charcoal-800/30">
                  <span className="text-xs font-mono text-gold-400">{m}</span>
                  <button
                    onClick={() => runMigration(m)}
                    disabled={running}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => runMigration()}
              disabled={running}
              className="mt-3 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {running ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running migrations...
                </>
              ) : (
                `Apply All (${status.migrations.pending.length})`
              )}
            </button>
          </div>
        )}

        {/* All caught up */}
        {status && status.migrations.pending.length === 0 && status.tables.length > 0 && (
          <p className="text-xs text-emerald-400/70 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            All migrations applied. Database is up to date.
          </p>
        )}

        {/* Empty database prompt */}
        {hasNoTables && status.migrations.pending.length > 0 && (
          <div className="bg-gold-500/5 border border-gold-500/15 rounded-lg p-4">
            <p className="text-sm text-gold-300 font-medium mb-1">Database is empty</p>
            <p className="text-xs text-charcoal-400">
              Click &quot;Apply All&quot; above to create the {status.migrations.pending.length} migration(s)
              and set up all tables.
            </p>
          </div>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase tracking-wider mb-2">Results</p>
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 py-1 ${r.status === "failed" ? "text-red-400" : "text-emerald-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${r.status === "failed" ? "bg-red-400" : "bg-emerald-400"}`} />
                <span className="text-xs font-mono">{r.name}</span>
                <span className="text-[10px] text-charcoal-500">— {r.status}</span>
                {r.error && <span className="text-[10px] text-red-400/70 ml-2">{r.error}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3">
            <p className="text-xs text-red-400 font-mono break-all">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface AQMaterial {
  code: string;
  display_name: string;
  processes: string[];
}

function AutoQuotePanel() {
  const [status, setStatus] = useState<{
    success: boolean;
    status: string;
    httpStatus?: number;
    error?: string;
    materials?: number;
    rateCardVersion?: string;
    materialList?: AQMaterial[];
    baseUrl?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);

  const test = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/autoquote");
      setStatus(await res.json());
    } catch {
      setStatus({ success: false, status: "error", error: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = status?.status === "connected" ? "bg-emerald-400" : status?.status === "not_configured" ? "bg-charcoal-600" : "bg-red-400";

  return (
    <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-charcoal-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${status ? statusColor : "bg-charcoal-600"}`} />
          <h3 className="text-sm font-bold text-white">AutoQuote Bridge</h3>
          {status?.status === "connected" && (
            <span className="text-[10px] text-emerald-400 font-mono">{status.materials} materials</span>
          )}
        </div>
        <button
          onClick={test}
          disabled={loading}
          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Connection"}
        </button>
      </div>

      <div className="p-6">
        {!status && !loading && (
          <p className="text-xs text-charcoal-500">Click &quot;Test Connection&quot; to verify the AutoQuote bridge API.</p>
        )}

        {loading && (
          <div className="flex items-center gap-3">
            <svg className="animate-spin w-4 h-4 text-charcoal-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-charcoal-400">Calling GET /bridge/materials...</span>
          </div>
        )}

        {status && !loading && (
          <div className="space-y-3">
            {status.success ? (
              <>
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Connected — {status.materials} materials available
                </div>
                {status.rateCardVersion && (
                  <p className="text-[11px] text-charcoal-500">Rate card: {status.rateCardVersion}</p>
                )}
                {status.materialList && status.materialList.length > 0 && (
                  <div>
                    <button onClick={() => setShowMaterials(!showMaterials)} className="text-[11px] text-charcoal-400 hover:text-charcoal-300 font-medium">
                      {showMaterials ? "Hide" : "Show"} material list
                    </button>
                    {showMaterials && (
                      <div className="mt-3 space-y-2">
                        {status.materialList.map((m) => (
                          <div key={m.code} className="flex items-center justify-between bg-charcoal-950/40 rounded-lg px-3 py-2 border border-charcoal-800/30">
                            <div>
                              <span className="text-xs font-mono text-charcoal-200">{m.code}</span>
                              <span className="text-xs text-charcoal-500 ml-2">{m.display_name}</span>
                            </div>
                            <div className="flex gap-1.5">
                              {m.processes.map((p) => (
                                <span key={p} className="text-[9px] text-charcoal-500 bg-charcoal-800 px-1.5 py-0.5 rounded font-mono">{p}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div>
                <p className="text-sm text-red-400 mb-1">
                  {status.status === "not_configured" ? "Not configured" : status.status === "unreachable" ? "Unreachable" : `Error (HTTP ${status.httpStatus})`}
                </p>
                <p className="text-xs text-charcoal-400 font-mono bg-charcoal-950 rounded p-2 break-all">{status.error}</p>
                {status.baseUrl && <p className="text-[10px] text-charcoal-600 mt-2">Base URL: {status.baseUrl}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PricingSettingsPanel() {
  const [markup, setMarkup] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.estimate_markup_pct) setMarkup(d.settings.estimate_markup_pct);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "estimate_markup_pct", value: markup }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-white mb-1">Estimate Markup</p>
          <p className="text-xs text-charcoal-500 leading-relaxed">
            Buffer added to cached AutoQuote estimates shown to customers. Protects against price increases between quote and confirmation.
            The actual confirmed price is unaffected — this only pads what customers see before purchasing.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {loading ? (
            <div className="w-16 h-9 bg-charcoal-800/50 rounded animate-pulse" />
          ) : (
            <>
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                value={markup}
                onChange={(e) => setMarkup(e.target.value)}
                className="w-16 bg-charcoal-950 border border-charcoal-700/50 rounded px-2.5 py-2 text-sm text-charcoal-100 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />
              <span className="text-sm text-charcoal-400">%</span>
              <button
                onClick={handleSave}
                className={`px-3 py-2 text-[10px] font-bold rounded uppercase tracking-wider transition-colors ${saved ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-500 hover:bg-emerald-400 text-white"}`}
              >
                {saved ? "Saved" : "Save"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    activeParts: number; recentParts: number;
    openOrders: number; pendingOrders: number;
    scanQueue: number; awaitingScan: number;
    contributors: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.stats); })
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Active Parts", value: stats?.activeParts ?? "—", change: stats ? `+${stats.recentParts} this month` : "Loading..." },
    { label: "Open Orders", value: stats?.openOrders ?? "—", change: stats?.pendingOrders ? `${stats.pendingOrders} pending quote` : "—" },
    { label: "Scan Queue", value: stats?.scanQueue ?? "—", change: stats?.awaitingScan ? `${stats.awaitingScan} awaiting scan` : "—" },
    { label: "Contributors", value: stats?.contributors ?? "—", change: "" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-charcoal-400 mt-1">
          Backyard Restoration operations overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((s) => (
          <div key={s.label} className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5">
            <p className="text-[10px] text-charcoal-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-3xl font-extrabold text-white mt-1">{s.value}</p>
            {s.change && <p className="text-[11px] text-charcoal-500 mt-1">{s.change}</p>}
          </div>
        ))}
      </div>

      {/* Pricing Settings */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-charcoal-300 uppercase tracking-wider mb-4">
          Pricing Settings
        </h2>
        <PricingSettingsPanel />
      </div>

      {/* Database & Migrations */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-charcoal-300 uppercase tracking-wider mb-4">
          Database & Migrations
        </h2>
        <MigrationsPanel />
      </div>

      {/* AutoQuote Bridge */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-charcoal-300 uppercase tracking-wider mb-4">
          AutoQuote Bridge
        </h2>
        <AutoQuotePanel />
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-charcoal-300 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <a href="/admin/parts" className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5 hover:border-emerald-500/20 transition-colors group">
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Manage Parts</h3>
            <p className="text-xs text-charcoal-500 mt-1">Add, edit, or remove parts from the catalog</p>
          </a>
          <a href="/admin/scans" className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5 hover:border-emerald-500/20 transition-colors group">
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Scan Queue</h3>
            <p className="text-xs text-charcoal-500 mt-1">Process incoming donor parts and scan requests</p>
          </a>
          <a href="/admin/orders" className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5 hover:border-emerald-500/20 transition-colors group">
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Orders</h3>
            <p className="text-xs text-charcoal-500 mt-1">View and manage production queue and shipments</p>
          </a>
        </div>
      </div>
    </div>
  );
}
