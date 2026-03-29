"use client";

import { useState, useRef, useCallback } from "react";
import type { QuoteResult } from "@/lib/pricing/types";

type UploadTab = "dxf" | "photo";

const materialOptions = [
  { value: "paper", label: "Paper Gasket" },
  { value: "cork", label: "Cork" },
  { value: "rubber", label: "Rubber" },
  { value: "fiber", label: "Fiber" },
  { value: "neoprene", label: "Neoprene" },
];

const thicknessOptions = [
  { value: "1/32", label: '1/32"' },
  { value: "1/16", label: '1/16"' },
  { value: "3/32", label: '3/32"' },
  { value: "1/8", label: '1/8"' },
  { value: "3/16", label: '3/16"' },
  { value: "1/4", label: '1/4"' },
];

export default function QuoteBuilder() {
  const [activeTab, setActiveTab] = useState<UploadTab>("dxf");
  const [file, setFile] = useState<File | null>(null);
  const [material, setMaterial] = useState("");
  const [thickness, setThickness] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [rush, setRush] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [photoConfidence, setPhotoConfidence] = useState<number | null>(null);
  const [photoWarnings, setPhotoWarnings] = useState<string[]>([]);
  const [dxfBase64, setDxfBase64] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      // Validate file type
      if (activeTab === "dxf") {
        const ext = selectedFile.name.toLowerCase().split(".").pop();
        if (ext !== "dxf" && ext !== "dwg") {
          setError("Please upload a .dxf or .dwg file");
          return;
        }
      }
      setFile(selectedFile);
      setError(null);
      setQuoteResult(null);
    },
    [activeTab]
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFileSelect(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleGetQuote = async () => {
    if (!file) return;
    if (!material) {
      setError("Please select a material");
      return;
    }
    if (!thickness) {
      setError("Please select a thickness");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (activeTab === "dxf") {
        // Real API call for DXF files
        const formData = new FormData();
        formData.append("file", file);
        formData.append("material", material);
        formData.append("thickness", thickness);
        formData.append("quantity", quantity);
        formData.append("rush", String(rush));

        const res = await fetch("/api/quote", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!data.success) {
          setError(data.error || "Failed to generate quote");
          return;
        }

        setQuoteResult(data.quote);
      } else {
        // Photo tab — real API call
        const formData = new FormData();
        formData.append("file", file);
        formData.append("material", material);
        formData.append("thickness", thickness);
        formData.append("quantity", quantity);
        formData.append("rush", String(rush));

        const res = await fetch("/api/photo-to-dxf", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!data.success) {
          setError(data.error || "Failed to process photo");
          return;
        }

        setQuoteResult(data.quote);
        setPhotoConfidence(data.confidence ?? null);
        setPhotoWarnings(data.warnings ?? []);
        setDxfBase64(data.dxfBase64 ?? null);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setQuoteResult(null);
    setError(null);
    setMaterial("");
    setThickness("");
    setQuantity("1");
    setRush(false);
    setIsLoading(false);
    setPhotoConfidence(null);
    setPhotoWarnings([]);
    setDxfBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectClasses =
    "w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-gold-500/40 focus:border-gold-500/40 transition-colors appearance-none";
  const inputClasses =
    "w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-gold-500/40 focus:border-gold-500/40 transition-colors";

  const qty = parseInt(quantity) || 1;

  return (
    <section id="quote" className="py-24 md:py-32 blueprint-grid relative">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">
            The Core Tool
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight">
            Upload Your Gasket. Get a Quote. Get Back to Work.
          </h2>
          <p className="mt-5 text-charcoal-400 max-w-2xl mx-auto leading-relaxed">
            DXF file or photo. Five minutes. Instant estimate. That&apos;s it.
          </p>
        </div>

        {/* Trust + speed bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 px-4 py-4 bg-charcoal-900/40 rounded-xl border border-charcoal-800/50 max-w-2xl mx-auto">
          <span className="flex items-center gap-2 text-xs text-charcoal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <strong>Cut to ±1/32&quot; accuracy</strong>
          </span>
          <span className="text-charcoal-700 hidden sm:inline">&bull;</span>
          <span className="flex items-center gap-2 text-xs text-charcoal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            <strong>Most ship in 1–2 days</strong>
          </span>
          <span className="text-charcoal-700 hidden sm:inline">&bull;</span>
          <span className="flex items-center gap-2 text-xs text-charcoal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-copper-400" />
            <strong>Rush same-day available</strong>
          </span>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-7 gap-6">
            {/* Left panel — upload + form */}
            <div className="lg:col-span-4 bg-charcoal-900 border border-gold-500/15 rounded-2xl p-6 sm:p-10 card-glow shadow-2xl shadow-gold-500/5">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={activeTab === "dxf" ? ".dxf,.dwg" : ".jpg,.jpeg,.png,.webp"}
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Tabs */}
              <div className="flex rounded-xl bg-charcoal-950/60 p-1.5 mb-7 border border-charcoal-800/30">
                <button
                  onClick={() => {
                    setActiveTab("dxf");
                    handleReset();
                  }}
                  className={`flex-1 py-3 text-[13px] font-semibold rounded-lg transition-all ${
                    activeTab === "dxf"
                      ? "bg-charcoal-800 text-white shadow-sm"
                      : "text-charcoal-500 hover:text-charcoal-300"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Upload DXF
                  </span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("photo");
                    handleReset();
                  }}
                  className={`flex-1 py-3 text-[13px] font-semibold rounded-lg transition-all ${
                    activeTab === "photo"
                      ? "bg-charcoal-800 text-white shadow-sm"
                      : "text-charcoal-500 hover:text-charcoal-300"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                    Upload Photo
                  </span>
                </button>
              </div>

              {/* Error display */}
              {error && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Upload zone */}
              {!file ? (
                <div
                  onClick={handleUploadClick}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`upload-zone ${
                    dragOver ? "active" : ""
                  } rounded-xl p-10 sm:p-16 text-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-charcoal-800/60 flex items-center justify-center mb-6 border border-charcoal-700/30">
                      <svg
                        className="w-9 h-9 text-gold-500/50"
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
                    <p className="text-base font-semibold text-charcoal-100 mb-2">
                      {activeTab === "dxf"
                        ? "Drop your DXF file here"
                        : "Drop your gasket photo here"}
                    </p>
                    <p className="text-sm text-charcoal-500 mb-5">
                      or tap to browse files
                    </p>
                    {activeTab === "dxf" ? (
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-charcoal-500 bg-charcoal-800/40 px-3 py-1.5 rounded-full border border-charcoal-700/30 font-mono">
                          .dxf
                        </span>
                        <span className="text-[11px] text-charcoal-500 bg-charcoal-800/40 px-3 py-1.5 rounded-full border border-charcoal-700/30 font-mono">
                          .dwg
                        </span>
                      </div>
                    ) : (
                      <div className="bg-gold-500/4 border border-gold-500/12 rounded-xl px-5 py-4 mt-1 max-w-sm">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-gold-400/60 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                          </svg>
                          <p className="text-xs text-gold-300/80 leading-relaxed text-left">
                            <strong className="text-gold-400">Important:</strong>{" "}
                            Place your gasket on a standard <strong>8.5&quot; x 11&quot;</strong>{" "}
                            sheet of white paper before photographing. Shoot from{" "}
                            <strong>directly above</strong>. All paper edges must be visible.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Upload success */}
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 mb-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/8 flex items-center justify-center flex-shrink-0 border border-emerald-500/10">
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-400">
                        File uploaded
                      </p>
                      <p className="text-xs text-charcoal-500 truncate">
                        {file.name} — {(file.size / 1024).toFixed(0)} KB
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
                        {materialOptions.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
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
                          {thicknessOptions.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
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
                        Notes{" "}
                        <span className="text-charcoal-600 normal-case tracking-normal">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Equipment type, application details, special requirements..."
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
                          Same-day cutting + next-day shipping
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
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-obsidian font-bold text-sm rounded-lg transition-all shadow-lg shadow-gold-500/10 uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Get Instant Estimate"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Right panel: quote result */}
            <div className="lg:col-span-3">
              <div className="bg-charcoal-900 border border-gold-500/15 rounded-2xl p-6 sm:p-8 sticky top-24 card-glow shadow-2xl shadow-gold-500/5">
                <h3 className="text-[12px] font-bold text-white uppercase tracking-[0.15em] mb-6">
                  Your Instant Estimate
                </h3>

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-charcoal-800/30 flex items-center justify-center mb-5 border border-charcoal-800/40">
                      <svg
                        className="animate-spin w-6 h-6 text-gold-400"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-charcoal-300 font-semibold mb-1">
                      {activeTab === "photo"
                        ? "Tracing gasket from photo..."
                        : "Analyzing geometry..."}
                    </p>
                    <p className="text-xs text-charcoal-500">
                      {activeTab === "photo"
                        ? "Detecting paper, extracting outline, generating DXF"
                        : "Calculating area, cut length, and pricing"}
                    </p>
                  </div>
                ) : !quoteResult ? (
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
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-charcoal-200 font-semibold mb-2">
                      Upload to Generate
                    </p>
                    <p className="text-xs text-charcoal-500 max-w-[240px] mx-auto leading-relaxed">
                      Your price, material, and ship date appear instantly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Geometry info */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-charcoal-950/40 rounded-lg px-3 py-2 border border-charcoal-800/30">
                        <span className="text-charcoal-500 text-[9px] uppercase tracking-wider">
                          Area
                        </span>
                        <p className="text-charcoal-100 font-semibold text-xs mt-0.5">
                          {quoteResult.geometry.totalArea} sq in
                        </p>
                      </div>
                      <div className="bg-charcoal-950/40 rounded-lg px-3 py-2 border border-charcoal-800/30">
                        <span className="text-charcoal-500 text-[9px] uppercase tracking-wider">
                          Cut Length
                        </span>
                        <p className="text-charcoal-100 font-semibold text-xs mt-0.5">
                          {quoteResult.geometry.totalCutLength} in
                        </p>
                      </div>
                      <div className="bg-charcoal-950/40 rounded-lg px-3 py-2 border border-charcoal-800/30">
                        <span className="text-charcoal-500 text-[9px] uppercase tracking-wider">
                          Size
                        </span>
                        <p className="text-charcoal-100 font-semibold text-xs mt-0.5">
                          {quoteResult.geometry.boundingBox.width}&quot; x{" "}
                          {quoteResult.geometry.boundingBox.height}&quot;
                        </p>
                      </div>
                      <div className="bg-charcoal-950/40 rounded-lg px-3 py-2 border border-charcoal-800/30">
                        <span className="text-charcoal-500 text-[9px] uppercase tracking-wider">
                          Holes
                        </span>
                        <p className="text-charcoal-100 font-semibold text-xs mt-0.5">
                          {quoteResult.geometry.holeCount}
                        </p>
                      </div>
                    </div>

                    {/* Quote details */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm py-0.5">
                        <span className="text-charcoal-500">Material</span>
                        <span className="text-charcoal-100 font-medium">
                          {quoteResult.material}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm py-0.5">
                        <span className="text-charcoal-500">Thickness</span>
                        <span className="text-charcoal-100 font-medium">
                          {quoteResult.thickness}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm py-0.5">
                        <span className="text-charcoal-500">Quantity</span>
                        <span className="text-charcoal-100 font-medium">
                          {qty} pcs
                        </span>
                      </div>
                    </div>

                    {/* Price breakdown */}
                    <div className="gold-divider" />
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-charcoal-500">
                        <span>Material cost</span>
                        <span>${quoteResult.breakdown.materialCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-charcoal-500">
                        <span>Cutting cost</span>
                        <span>${quoteResult.breakdown.cuttingCost.toFixed(2)}</span>
                      </div>
                      {quoteResult.breakdown.complexityCharge > 0 && (
                        <div className="flex justify-between text-charcoal-500">
                          <span>Complexity</span>
                          <span>
                            ${quoteResult.breakdown.complexityCharge.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-charcoal-500">
                        <span>Unit price</span>
                        <span className="text-charcoal-200 font-medium">
                          ${quoteResult.unitPrice.toFixed(2)}
                        </span>
                      </div>
                      {quoteResult.volumeDiscount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Volume discount</span>
                          <span>
                            -{(quoteResult.volumeDiscount * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-charcoal-500">
                        <span>Handling fee</span>
                        <span>${quoteResult.breakdown.handlingFee.toFixed(2)}</span>
                      </div>
                      {quoteResult.rushFee > 0 && (
                        <div className="flex justify-between text-gold-400">
                          <span>Rush fee</span>
                          <span>+${quoteResult.rushFee.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="gold-divider" />

                    <div className="flex items-end justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-charcoal-500 uppercase tracking-wider">
                          Total
                        </span>
                        <p className="text-3xl font-extrabold text-white mt-1">
                          ${quoteResult.total.toFixed(2)}
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
                            {quoteResult.leadTime}
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

                    {/* Photo-specific: confidence + warnings + DXF download */}
                    {activeTab === "photo" && photoConfidence !== null && (
                      <div className="space-y-3">
                        {/* Confidence bar */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-charcoal-500 uppercase tracking-wider">
                              Trace Confidence
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                photoConfidence > 0.7
                                  ? "text-emerald-400"
                                  : photoConfidence > 0.4
                                  ? "text-gold-400"
                                  : "text-red-400"
                              }`}
                            >
                              {Math.round(photoConfidence * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-charcoal-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                photoConfidence > 0.7
                                  ? "bg-emerald-400"
                                  : photoConfidence > 0.4
                                  ? "bg-gold-400"
                                  : "bg-red-400"
                              }`}
                              style={{ width: `${photoConfidence * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Warnings */}
                        {photoWarnings.length > 0 && (
                          <div className="bg-gold-500/4 border border-gold-500/12 rounded-lg p-3 space-y-1.5">
                            {photoWarnings.map((w, i) => (
                              <p
                                key={i}
                                className="text-[11px] text-gold-300/80 leading-relaxed flex items-start gap-2"
                              >
                                <span className="text-gold-400 flex-shrink-0 mt-px">!</span>
                                {w}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Download generated DXF */}
                        {dxfBase64 && (
                          <button
                            onClick={() => {
                              const blob = new Blob(
                                [
                                  Uint8Array.from(atob(dxfBase64), (c) =>
                                    c.charCodeAt(0)
                                  ),
                                ],
                                { type: "application/dxf" }
                              );
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = "gasket_traced.dxf";
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="w-full py-2.5 border border-charcoal-700/50 hover:border-gold-500/20 text-charcoal-300 hover:text-gold-300 text-xs font-medium rounded-lg transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                              />
                            </svg>
                            Download Generated DXF
                          </button>
                        )}
                      </div>
                    )}

                    <button className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/10 uppercase tracking-wide">
                      Confirm &amp; Request Review
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
