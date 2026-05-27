export default function AdminDashboard() {
  const stats = [
    { label: "Active Parts", value: "15", change: "+3 this month" },
    { label: "Open Orders", value: "0", change: "—" },
    { label: "Scan Queue", value: "4", change: "2 awaiting scan" },
    { label: "Contributors", value: "8", change: "+2 this month" },
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
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5"
          >
            <p className="text-[10px] text-charcoal-500 uppercase tracking-wider">
              {s.label}
            </p>
            <p className="text-3xl font-extrabold text-white mt-1">{s.value}</p>
            <p className="text-[11px] text-charcoal-500 mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-charcoal-300 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <a
            href="/admin/parts"
            className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5 hover:border-emerald-500/20 transition-colors group"
          >
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              Manage Parts
            </h3>
            <p className="text-xs text-charcoal-500 mt-1">
              Add, edit, or remove parts from the catalog
            </p>
          </a>
          <a
            href="/admin/scans"
            className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5 hover:border-emerald-500/20 transition-colors group"
          >
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              Scan Queue
            </h3>
            <p className="text-xs text-charcoal-500 mt-1">
              Process incoming donor parts and scan requests
            </p>
          </a>
          <a
            href="/admin/orders"
            className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5 hover:border-emerald-500/20 transition-colors group"
          >
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              Orders
            </h3>
            <p className="text-xs text-charcoal-500 mt-1">
              View and manage production queue and shipments
            </p>
          </a>
        </div>
      </div>

      {/* AutoQuote status */}
      <div>
        <h2 className="text-sm font-bold text-charcoal-300 uppercase tracking-wider mb-4">
          AutoQuote Integration
        </h2>
        <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 rounded-full bg-charcoal-600" />
            <span className="text-sm text-charcoal-400">
              Not configured — set AUTOQUOTE_BASE_URL and AUTOQUOTE_BRIDGE_TOKEN
              in .env.local
            </span>
          </div>
          <p className="text-xs text-charcoal-500">
            AutoQuote provides real-time pricing for CNC, laser, waterjet, and
            sheet metal parts. Once connected, part variants will show live
            pricing from the bridge API.
          </p>
        </div>
      </div>
    </div>
  );
}
