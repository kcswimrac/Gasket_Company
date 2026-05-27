export default function CustomersAdmin() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-charcoal-400 mt-1">CRM and customer management</p>
        </div>
        <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors">
          + Add Customer
        </button>
      </div>

      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-charcoal-800/30 flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-charcoal-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-white mb-2">No customers yet</h3>
        <p className="text-sm text-charcoal-500 max-w-sm mx-auto">
          Customer records will be created when orders come in. Shop accounts
          (B2B) can be added manually for net-30 terms.
        </p>
      </div>
    </div>
  );
}
