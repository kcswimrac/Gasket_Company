"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        padding: "10px 20px",
        background: "#111",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      Print / Save PDF
    </button>
  );
}
