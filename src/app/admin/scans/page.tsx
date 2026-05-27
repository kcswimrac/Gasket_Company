"use client";

import { BOUNTY_BOARD } from "@/lib/restoration/catalog";

const scanItems = [
  { id: "SQ-001", part: "Fuel Tank Sediment Bowl Bracket", application: "1939–1947 Ford 2N / 9N", contributor: "Jim & Sons Tractor", status: "received", receivedDate: "2026-05-20" },
  { id: "SQ-002", part: "Rear Footpeg Mount Bracket", application: "1965–1970 Honda CB450", contributor: "VJMC Member", status: "scanning", receivedDate: "2026-05-15" },
  { id: "SQ-003", part: "Compound Rest Lock Nut", application: "Hardinge HLV-H Lathe", contributor: "Vintage Machinery Forum", status: "modeling", receivedDate: "2026-05-10" },
  { id: "SQ-004", part: "Hood Latch Release Cable Bracket", application: "1971–1973 Plymouth Barracuda", contributor: "Mike R.", status: "received", receivedDate: "2026-05-22" },
];

const statusColors: Record<string, string> = {
  received: "bg-gold-500/10 text-gold-400",
  scanning: "bg-blue-500/10 text-blue-400",
  modeling: "bg-copper-500/10 text-copper-400",
  complete: "bg-emerald-500/10 text-emerald-400",
};

export default function ScansAdmin() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Scan Queue</h1>
          <p className="text-sm text-charcoal-400 mt-1">
            Donor parts in the scan → model → catalog pipeline
          </p>
        </div>
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { label: "Received", count: scanItems.filter((s) => s.status === "received").length, color: "gold" },
          { label: "Scanning", count: scanItems.filter((s) => s.status === "scanning").length, color: "blue" },
          { label: "Modeling", count: scanItems.filter((s) => s.status === "modeling").length, color: "copper" },
          { label: "Complete", count: 0, color: "emerald" },
        ].map((stage) => (
          <div key={stage.label} className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-white">{stage.count}</p>
            <p className="text-[10px] text-charcoal-500 uppercase tracking-wider mt-1">{stage.label}</p>
          </div>
        ))}
      </div>

      {/* Scan items table */}
      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-800/50">
                {["ID", "Part", "Application", "Contributor", "Status", "Received", "Actions"].map((h) => (
                  <th key={h} className="py-3 px-4 text-left text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scanItems.map((item) => (
                <tr key={item.id} className="border-b border-charcoal-800/30 hover:bg-charcoal-900/30">
                  <td className="py-3 px-4 text-[10px] font-mono text-charcoal-600">{item.id}</td>
                  <td className="py-3 px-4 text-sm text-white font-medium">{item.part}</td>
                  <td className="py-3 px-4 text-xs text-charcoal-400">{item.application}</td>
                  <td className="py-3 px-4 text-xs text-charcoal-400">{item.contributor}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-charcoal-500">{item.receivedDate}</td>
                  <td className="py-3 px-4">
                    <button className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium">
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bounty board preview */}
      <div>
        <h2 className="text-sm font-bold text-charcoal-300 uppercase tracking-wider mb-4">
          Bounty Board ({BOUNTY_BOARD.length} wanted parts)
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BOUNTY_BOARD.map((b) => (
            <div key={b.id} className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-4">
              <p className="text-sm font-medium text-white">{b.partName}</p>
              <p className="text-[11px] text-charcoal-500 mt-0.5">{b.application}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-charcoal-400">{b.requestedBy} requests</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusColors[b.status === "seeking_donor" ? "received" : b.status]}`}>
                  {b.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
