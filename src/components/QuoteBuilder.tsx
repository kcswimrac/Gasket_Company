"use client";

import { useState } from "react";

type UploadTab = "dxf" | "photo";

const materials = [
  "Paper Gasket",
  "Cork",
  "Rubber",
  "Fiber",
  "Neoprene",
  "Not Sure",
];

const thicknesses = ['1/32"', '1/16"', '3/32"', '1/8"', '3/16"', '1/4"'];

export default function QuoteBuilder() {
  const [activeTab, setActiveTab] = useState<UploadTab>("dxf");
  const [uploaded, setUploaded] = useState(false);
  const [material, setMaterial] = useState("");
  const [thickness, setThickness] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [rush, setRush] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUploadClick = () => setUploaded(true);

  const handleGetQuote = () => setShowQuote(true);

  const handleReset = () => {
    setUploaded(false);
    setShowQuote(false);
    setMaterial("");
    setThickness("");
    setQuantity("1");
    setRush(false);
  };

  const qty = parseInt(quantity) || 1;
  const unitPrice =
    material === "Neoprene" ? 14.5 : material === "Cork" ? 11.0 : 9.5;
  const rushFee = rush ? 25 : 0;
  const totalEstimate = (unitPrice * qty + rushFee).toFixed(2);

  const selectClasses =
    "w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-gold-500/40 focus:border-gold-500/40 transition-colors appearance-none";
  const inputClasses =
    "w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-gold-500/40 focus:border-gold-500/40 transition-colors";

  return (
    <section id="quote" className="py-24 md:py-32 blueprint-grid relative">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">
            Get Started
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight">
            Upload &amp; Get Your Quote
          </h2>
          <p className="mt-5 text-charcoal-400 max-w-xl mx-auto leading-relaxed">
            Submit your file, specify your requirements, and receive an instant
            estimate.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left panel */}
            <div className="lg:col-span-3 bg-charcoal-900/60 border border-charcoal-800/60 rounded-2xl p-5 sm:p-7 card-glow">
              {/* Tabs */}
              <div className="flex rounded-xl bg-charcoal-950/60 p-1 mb-7 border border-charcoal-800/30">
                <button
                  onClick={() => {
                    setActiveTab("dxf");
                    setUploaded(false);
                    setShowQuote(false);
                  }}
                  className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${
                    activeTab === "dxf"
                      ? "bg-charcoal-800 text-white shadow-sm"
                      : "text-charcoal-500 hover:text-charcoal-300"
                  }`}
                >
                  Upload DXF
                </button>
                <button
                  onClick={() => {
                    setActiveTab("photo");
                    setUploaded(false);
                    setShowQuote(false);
                  }}
                  className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${
                    activeTab === "photo"
                      ? "bg-charcoal-800 text-white shadow-sm"
                      : "text-charcoal-500 hover:text-charcoal-300"
                  }`}
                >
                  Upload Photo
                </button>
              </div>

              {/* Upload zone */}
              {!uploaded ? (
                <div
                  onClick={handleUploadClick}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    setUploaded(true);
                  }}
                  className={`upload-zone ${
                    dragOver ? "active" : ""
                  } rounded-xl p-10 sm:p-14 text-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-charcoal-800/60 flex items-center justify-center mb-5 border border-charcoal-700/30">
                      <svg
                        className="w-7 h-7 text-gold-500/50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-charcoal-200 mb-1.5">
                      {activeTab === "dxf"
                        ? "Drag & drop your DXF file"
                        : "Drag & drop your gasket photo"}
                    </p>
                    <p className="text-xs text-charcoal-500 mb-4">
                      or tap to browse files
                    </p>
                    {activeTab === "dxf" ? (
                      <span className="text-[11px] text-charcoal-600 uppercase tracking-wider">
                        Accepts .dxf and .dwg
                      </span>
                    ) : (
                      <div className="bg-gold-500/3 border border-gold-500/10 rounded-lg px-5 py-3 mt-1 max-w-sm">
                        <p className="text-xs text-gold-300/70 leading-relaxed">
                          <strong className="text-gold-400/80">Scale Reference:</strong>{" "}
                          Place your gasket on a standard 8.5&quot; x 11&quot;
                          sheet of white paper before photographing. This
                          provides the dimensional reference for accurate sizing.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Upload success */}
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 mb-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/8 flex items-center justify-center flex-shrink-0 border border-emerald-500/10">
                      <svg
                        className="w-5 h-5 text-emerald-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-400">
                        File uploaded
                      </p>
                      <p className="text-xs text-charcoal-500 truncate">
                        {activeTab === "dxf"
                          ? "pump_cover_gasket.dxf — 42 KB"
                          : "gasket_photo_001.jpg — 2.4 MB"}
                      </p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="text-[11px] text-charcoal-500 hover:text-gold-400 font-medium uppercase tracking-wider transition-colors flex-shrink-0"
                    >
                      Replace
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">
                        Material
                      </label>
                      <select
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        className={selectClasses}
                      >
                        <option value="">Select material...</option>
                        {materials.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">
                          Thickness
                        </label>
                        <select
                          value={thickness}
                          onChange={(e) => setThickness(e.target.value)}
                          className={selectClasses}
                        >
                          <option value="">Select...</option>
                          {thicknesses.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">
                        Notes <span className="text-charcoal-600 normal-case tracking-normal">(optional)</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Special requirements, dimensions, or application details..."
                        className={`${inputClasses} placeholder:text-charcoal-600 resize-none`}
                      />
                    </div>

                    {/* Rush toggle */}
                    <div
                      onClick={() => setRush(!rush)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        rush
                          ? "border-gold-500/25 bg-gold-500/3"
                          : "border-charcoal-700/40 hover:border-charcoal-600/50"
                      }`}
                    >
                      <div>
                        <span className="text-sm text-charcoal-200 font-semibold">
                          Rush Order
                        </span>
                        <p className="text-xs text-charcoal-500 mt-0.5">
                          Same-day cutting + expedited shipping
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gold-400/70 font-medium">
                          +$25
                        </span>
                        <div
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            rush ? "bg-gold-500" : "bg-charcoal-700"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                              rush ? "left-5.5" : "left-0.5"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleGetQuote}
                      className="w-full py-3.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-obsidian font-bold text-sm rounded-lg transition-all shadow-lg shadow-gold-500/10 uppercase tracking-wide"
                    >
                      Get Instant Estimate
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Right panel: quote result */}
            <div className="lg:col-span-2">
              <div className="bg-charcoal-900/60 border border-charcoal-800/60 rounded-2xl p-5 sm:p-7 sticky top-24 card-glow">
                <h3 className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-[0.15em] mb-6">
                  Quote Estimate
                </h3>

                {!showQuote ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-charcoal-800/30 flex items-center justify-center mb-5 border border-charcoal-800/40">
                      <svg
                        className="w-8 h-8 text-charcoal-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-charcoal-500 max-w-[200px] mx-auto leading-relaxed">
                      Upload a file and fill in details to see your estimate.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      {[
                        [
                          "File",
                          activeTab === "dxf"
                            ? "pump_cover_gasket.dxf"
                            : "gasket_photo_001.jpg",
                        ],
                        ["Material", material || "Standard"],
                        ["Thickness", thickness || '1/16"'],
                        ["Quantity", `${qty} pcs`],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex justify-between text-sm py-1"
                        >
                          <span className="text-charcoal-500">{label}</span>
                          <span className="text-charcoal-100 font-medium">
                            {value}
                          </span>
                        </div>
                      ))}
                      {rush && (
                        <div className="flex justify-between text-sm py-1">
                          <span className="text-gold-400">Rush Order</span>
                          <span className="text-gold-400 font-medium">
                            +$25.00
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="gold-divider" />

                    <div className="flex items-end justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-charcoal-500 uppercase tracking-wider">
                          Estimated Total
                        </span>
                        <p className="text-3xl font-extrabold text-white mt-1">
                          ${totalEstimate}
                        </p>
                      </div>
                      {rush && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gold-500/8 text-gold-400 border border-gold-500/15 uppercase tracking-wider">
                          Rush
                        </span>
                      )}
                    </div>

                    <div className="bg-charcoal-950/40 rounded-xl p-4 space-y-2.5 border border-charcoal-800/30">
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-charcoal-400">
                          Lead time:{" "}
                          <strong className="text-charcoal-100">
                            {rush ? "Same day" : "1–2 business days"}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-charcoal-400">
                          Shipping:{" "}
                          <strong className="text-charcoal-100">
                            {rush ? "Next-day available" : "Standard ground"}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <button className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/10 uppercase tracking-wide">
                      Request Final Review
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full py-2 text-xs text-charcoal-500 hover:text-gold-400 transition-colors uppercase tracking-wider font-medium"
                    >
                      Start Over
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
