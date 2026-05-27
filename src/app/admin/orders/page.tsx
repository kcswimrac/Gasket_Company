export default function OrdersAdmin() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-charcoal-400 mt-1">Production queue and fulfillment</p>
        </div>
      </div>

      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-charcoal-800/30 flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-charcoal-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-white mb-2">No orders yet</h3>
        <p className="text-sm text-charcoal-500 max-w-sm mx-auto">
          Orders will appear here when customers place them through the catalog.
          Each order tracks status from quote → paid → production → QC → shipped.
        </p>
      </div>
    </div>
  );
}
