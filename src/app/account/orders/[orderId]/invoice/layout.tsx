export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        minHeight: "100vh",
        color: "#1a1a1a",
      }}
    >
      {children}
    </div>
  );
}
