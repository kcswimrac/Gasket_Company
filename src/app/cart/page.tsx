"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const { items, count, total, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Your Cart</h1>
              <p className="text-sm text-charcoal-400 mt-1">{count} item{count !== 1 ? "s" : ""}</p>
            </div>
            {items.length > 0 && (
              <button onClick={clearCart} className="text-xs text-charcoal-500 hover:text-red-400 uppercase tracking-wider font-medium transition-colors">
                Clear Cart
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-2xl p-16 text-center">
              <svg className="w-12 h-12 text-charcoal-700 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <h3 className="text-base font-medium text-charcoal-300 mb-2">Cart is empty</h3>
              <p className="text-sm text-charcoal-500 mb-6">Browse the catalog to find the parts you need.</p>
              <a href="/catalog" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded uppercase tracking-wider transition-colors">
                Browse Catalog
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Items */}
              {items.map((item) => (
                <div key={item.id} className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5 flex flex-col sm:flex-row items-start gap-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white">{item.partName}</h3>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {item.tier && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold uppercase">{item.tier}</span>
                      )}
                      <span className="text-[10px] text-charcoal-400">{item.material}</span>
                      <span className="text-[10px] text-charcoal-500">{item.process}</span>
                    </div>
                    {item.leadTimeDays && (
                      <p className="text-[10px] text-charcoal-500 mt-1">{item.leadTimeDays} day lead time</p>
                    )}
                    {item.isEstimate && (
                      <p className="text-[10px] text-gold-400/70 mt-1">Estimate — final price confirmed after review</p>
                    )}
                  </div>

                  {/* Quantity + Price + Remove — bottom row on mobile */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-9 h-9 sm:w-7 sm:h-7 rounded bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 flex items-center justify-center text-sm transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm text-white font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 sm:w-7 sm:h-7 rounded bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 flex items-center justify-center text-sm transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0 w-24 ml-auto sm:ml-0">
                      {item.unitPrice ? (
                        <>
                          <p className="text-sm font-bold text-white">${item.totalPrice}</p>
                          <p className="text-[10px] text-charcoal-500">${item.unitPrice}/ea</p>
                        </>
                      ) : (
                        <p className="text-xs text-charcoal-500">TBD</p>
                      )}
                    </div>

                    {/* Remove */}
                    <button onClick={() => removeItem(item.id)} className="text-charcoal-600 hover:text-red-400 p-1 transition-colors shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-charcoal-400">Subtotal</span>
                  <span className="text-xl font-bold text-white">${total}</span>
                </div>

                {items.some((i) => i.isEstimate) && (
                  <div className="bg-gold-500/5 border border-gold-500/15 rounded-lg p-3 mb-4">
                    <p className="text-[11px] text-gold-300/80">
                      Some items are estimates. Final pricing will be confirmed after review.
                    </p>
                  </div>
                )}

                <a
                  href="/checkout"
                  className="block w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-lg uppercase tracking-wider transition-colors text-center"
                >
                  Proceed to Checkout
                </a>

                <a href="/catalog" className="block text-center text-xs text-charcoal-500 hover:text-charcoal-300 mt-3 uppercase tracking-wider transition-colors">
                  Continue Shopping
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
