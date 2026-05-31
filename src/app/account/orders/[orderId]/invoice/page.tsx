import { auth } from "@/auth";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import PrintButton from "./PrintButton";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

interface LineItem {
  notes: string | null;
  quantity: number;
  unit_price: string | null;
  total_price: string | null;
}

interface Order {
  id: string;
  status: string;
  total_price: string | null;
  notes: string | null;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_company: string | null;
  line_items: LineItem[];
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "customer") {
    redirect("/account/login");
  }

  const { orderId } = await params;
  const customerId = session.user.id;
  const sql = getSQL();

  const rows = await sql`
    SELECT
      o.id,
      o.status,
      o.total_price,
      o.notes,
      o.created_at,
      c.name as customer_name,
      c.email as customer_email,
      c.phone as customer_phone,
      c.company as customer_company,
      COALESCE(
        json_agg(
          json_build_object(
            'notes', li.notes,
            'quantity', li.quantity,
            'unit_price', li.unit_price,
            'total_price', li.total_price
          )
        ) FILTER (WHERE li.id IS NOT NULL),
        '[]'::json
      ) as line_items
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    LEFT JOIN order_line_items li ON li.order_id = o.id
    WHERE o.id = ${orderId} AND o.customer_id = ${customerId}
    GROUP BY o.id, c.id
  `;

  if (rows.length === 0) {
    redirect("/account");
  }

  const order = rows[0] as unknown as Order;
  const shortId = order.id.slice(0, 8).toUpperCase();
  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subtotal = order.line_items.reduce(
    (sum: number, li: LineItem) => sum + parseFloat(li.total_price || "0"),
    0
  );

  const totalPrice = parseFloat(order.total_price || "0");
  const hasDiscount = totalPrice > 0 && totalPrice < subtotal;
  const discountAmount = hasDiscount ? subtotal - totalPrice : 0;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            .print-btn { display: none !important; }
            .invoice-wrap { padding: 20px !important; }
          }
        `,
        }}
      />
      <PrintButton />
      <div
        className="invoice-wrap"
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: 40,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 14,
          lineHeight: 1.5,
          color: "#1a1a1a",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 40,
            paddingBottom: 20,
            borderBottom: "2px solid #111",
          }}
        >
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>
              Backyard Restoration
            </div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
              Custom Gaskets &amp; Reproduction Parts
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#111",
                textTransform: "uppercase",
                letterSpacing: 2,
                margin: 0,
              }}
            >
              Invoice
            </h2>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              #{shortId}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 30,
            marginBottom: 30,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#999",
                marginBottom: 4,
              }}
            >
              Bill To
            </div>
            <p style={{ fontWeight: 600, margin: "2px 0", fontSize: 13, color: "#333" }}>
              {order.customer_name}
            </p>
            <p style={{ margin: "2px 0", fontSize: 13, color: "#333" }}>
              {order.customer_email}
            </p>
            {order.customer_phone && (
              <p style={{ margin: "2px 0", fontSize: 13, color: "#333" }}>
                {order.customer_phone}
              </p>
            )}
            {order.customer_company && (
              <p style={{ margin: "2px 0", fontSize: 13, color: "#333" }}>
                {order.customer_company}
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#999",
                marginBottom: 4,
              }}
            >
              Invoice Date
            </div>
            <p style={{ margin: "2px 0", fontSize: 13, color: "#333" }}>
              {orderDate}
            </p>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#999",
                marginBottom: 4,
                marginTop: 12,
              }}
            >
              Status
            </div>
            <p
              style={{
                margin: "2px 0",
                fontSize: 13,
                color: "#333",
                textTransform: "capitalize",
              }}
            >
              {order.status.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 30,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  background: "#f5f5f5",
                  textAlign: "left",
                  padding: "10px 12px",
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#666",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Description
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  textAlign: "left",
                  padding: "10px 12px",
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#666",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  textAlign: "left",
                  padding: "10px 12px",
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#666",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Unit Price
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  textAlign: "right",
                  padding: "10px 12px",
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#666",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {order.line_items.map((li: LineItem, i: number) => {
              const desc = li.notes || "Line item";
              return (
                <tr key={i}>
                  <td
                    style={{
                      padding: 12,
                      fontSize: 13,
                      borderBottom: "1px solid #eee",
                      color: "#333",
                    }}
                  >
                    {desc}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      fontSize: 13,
                      borderBottom: "1px solid #eee",
                      color: "#333",
                    }}
                  >
                    {li.quantity}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      fontSize: 13,
                      borderBottom: "1px solid #eee",
                      color: "#333",
                    }}
                  >
                    {li.unit_price
                      ? `$${parseFloat(li.unit_price).toFixed(2)}`
                      : "TBD"}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      fontSize: 13,
                      borderBottom: "1px solid #eee",
                      color: "#333",
                      textAlign: "right",
                      fontWeight: 500,
                    }}
                  >
                    {li.total_price
                      ? `$${parseFloat(li.total_price).toFixed(2)}`
                      : "TBD"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 40 }}>
          <div style={{ width: 260 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                fontSize: 13,
                color: "#555",
              }}
            >
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {hasDiscount && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  fontSize: 13,
                  color: "#16a34a",
                }}
              >
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                fontSize: 13,
                color: "#555",
              }}
            >
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 10,
                marginTop: 6,
                fontSize: 16,
                fontWeight: 700,
                color: "#111",
                borderTop: "2px solid #111",
              }}
            >
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            paddingTop: 30,
            borderTop: "1px solid #eee",
          }}
        >
          <p style={{ fontSize: 14, color: "#333", fontWeight: 500, marginBottom: 8 }}>
            Thank you for your business
          </p>
          <p style={{ fontSize: 12, color: "#999" }}>
            privacy@backyardrestorations.com
          </p>
        </div>
      </div>
    </>
  );
}
