export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <p className="text-gray-600">Welcome to Novellia Pets! Dashboard stats will go here.</p>
      
      {/* TODO: Implement dashboard stats cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="text-sm font-medium text-gray-500">Total Pets</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">-</div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="text-sm font-medium text-gray-500">Vaccines Due Soon</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">-</div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="text-sm font-medium text-gray-500">Total Vaccines</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">-</div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="text-sm font-medium text-gray-500">Total Allergies</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">-</div>
        </div>
      </div>
    </div>
  );
}
