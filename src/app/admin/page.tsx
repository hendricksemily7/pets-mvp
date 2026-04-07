"use client";

/*
 * Admin Dashboard for admins to view pet related statistics.
 */
import { useState, useEffect } from "react";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";

const playfair = Playfair_Display({
  weight: "400",
  subsets: ["latin"],
});

interface DashboardStats {
  totalPets: number;
  totalVaccines: number;
  totalAllergies: number;
  severeAllergies: number;
  petsByType: Record<string, number>;
  upcomingVaccines: Array<{
    petName: string;
    petId: string;
    vaccineName: string;
    dueDate: string;
  }>;
  recentPets: Array<{
    id: string;
    name: string;
    animalType: string;
    ownerName: string;
    createdAt: string;
  }>;
  petsWithAllergies: Array<{
    id: string;
    name: string;
    animalType: string;
    allergyCount: number;
    severeCount: number;
  }>;
  allPets: Array<{
    id: string;
    name: string;
    animalType: string;
    ownerName: string;
    dateOfBirth: string;
    vaccineCount: number;
    allergyCount: number;
    createdAt: string;
  }>;
}

// Stat card component
function StatCard({
  title,
  value,
  icon,
  color = "bg-blue-500",
}: {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
      <div className={`${color} text-white p-3 rounded-lg text-2xl`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const petsPerPage = 10;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to fetch statistics");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D4D3A] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error || "Something went wrong"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`${playfair.className} text-3xl md:text-4xl font-medium text-[#2D4D3A]`}
          >
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Overview of all pets and medical records
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Pets"
            value={stats.totalPets}
            icon="🐾"
            color="bg-[#2D4D3A]"
          />
          <StatCard
            title="Total Vaccines"
            value={stats.totalVaccines}
            icon="💉"
            color="bg-blue-500"
          />
          <StatCard
            title="Total Allergies"
            value={stats.totalAllergies}
            icon="⚠️"
            color="bg-yellow-500"
          />
          <StatCard
            title="Severe Allergies"
            value={stats.severeAllergies}
            icon="🚨"
            color="bg-red-500"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pets by Type */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Pets by Type
            </h2>
            {Object.keys(stats.petsByType).length === 0 ? (
              <p className="text-gray-400 text-center py-4">No pets yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.petsByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="capitalize text-gray-700">{type}</span>
                          <span className="text-gray-500 text-sm">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2D4D3A] rounded-full transition-all"
                            style={{
                              width: `${(count / stats.totalPets) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Upcoming Vaccines */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Upcoming Vaccines (Next 30 Days)
            </h2>
            {stats.upcomingVaccines.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No upcoming vaccines
              </p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingVaccines.map((vaccine, idx) => (
                  <Link
                    key={idx}
                    href={`/pets/${vaccine.petId}`}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {vaccine.petName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {vaccine.vaccineName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {new Date(vaccine.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recently Added Pets */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Recently Added Pets
            </h2>
            {stats.recentPets.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No pets yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentPets.map((pet) => (
                  <Link
                    key={pet.id}
                    href={`/pets/${pet.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{pet.name}</p>
                      <p className="text-sm text-gray-500">
                        Owner: {pet.ownerName}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(pet.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pets with Allergies */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Pets Requiring Attention (Allergies)
            </h2>
            {stats.petsWithAllergies.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No pets with allergies
              </p>
            ) : (
              <div className="space-y-3">
                {stats.petsWithAllergies.map((pet) => (
                  <Link
                    key={pet.id}
                    href={`/pets/${pet.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{pet.name}</p>
                      <p className="text-sm text-gray-500">
                        {pet.allergyCount} allergies
                      </p>
                    </div>
                    {pet.severeCount > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        {pet.severeCount} severe
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Pets Table */}
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">All Pets</h2>
          </div>
          {stats.allPets.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No pets yet</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date of Birth
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vaccines
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Allergies
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.allPets
                      .slice((currentPage - 1) * petsPerPage, currentPage * petsPerPage)
                      .map((pet) => (
                        <tr key={pet.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/pets/${pet.id}`}
                              className="flex items-center gap-2 hover:text-[#2D4D3A]"
                            >
                              <span className="font-medium text-gray-800">
                                {pet.name}
                              </span>
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600 capitalize">
                            {pet.animalType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {pet.ownerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {new Date(pet.dateOfBirth).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {pet.vaccineCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                pet.allergyCount > 0
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {pet.allergyCount}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {stats.allPets.length > petsPerPage && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * petsPerPage + 1} to{" "}
                    {Math.min(currentPage * petsPerPage, stats.allPets.length)} of{" "}
                    {stats.allPets.length} pets
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">
                      Page {currentPage} of {Math.ceil(stats.allPets.length / petsPerPage)}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(Math.ceil(stats.allPets.length / petsPerPage), p + 1)
                        )
                      }
                      disabled={
                        currentPage === Math.ceil(stats.allPets.length / petsPerPage)
                      }
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}