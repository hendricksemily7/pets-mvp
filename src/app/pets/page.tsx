"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pet } from "../types";
import { toast } from "../components/Toast";

const animalTypes = ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Turtle", "Snake", "Other"];

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPet, setNewPet] = useState({
    name: "",
    animalType: "",
    dateOfBirth: "",
    ownerName: "",
    photoUrl: "",
  });
  const [addingPet, setAddingPet] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchPets = useCallback(async () => {
    try {
      const response = await fetch("/api/pets");
      const data = await response.json();
      setPets(data.pets || []);
    } catch (err) {
      console.error("Failed to fetch pets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const validatePetForm = () => {
    const errors: Record<string, string> = {};
    if (!newPet.name.trim()) errors.name = "Pet name is required";
    if (!newPet.animalType) errors.animalType = "Animal type is required";
    if (!newPet.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePetForm()) return;

    setAddingPet(true);
    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPet.name,
          animalType: newPet.animalType,
          dateOfBirth: new Date(newPet.dateOfBirth).toISOString(),
          ownerName: newPet.ownerName.trim() || "Unknown Owner",
        }),
      });

      if (!res.ok) throw new Error("Failed to add pet");

      setNewPet({ name: "", animalType: "", dateOfBirth: "", ownerName: "", photoUrl: "" });
      setFormErrors({});
      setShowAddModal(false);
      toast("Pet added successfully", "success");
      await fetchPets();
    } catch (err) {
      toast("Failed to add pet", "error");
    } finally {
      setAddingPet(false);
    }
  };

  // Filter pets by search term and animal type
  const filteredPets = pets.filter((pet) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      pet.name.toLowerCase().includes(searchLower) ||
      (pet.animalType && pet.animalType.toLowerCase().includes(searchLower));
    const matchesType =
      !filterType ||
      (pet.animalType && pet.animalType.toLowerCase().trim() === filterType.toLowerCase().trim());
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D4D3A]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-semibold text-[#2D4D3A]">Pets</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#2D4D3A] text-white px-4 py-2 rounded-lg hover:bg-[#1f3528] transition flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Pet
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#2D4D3A]"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#2D4D3A]"
          >
            <option value="">All Types</option>
            {animalTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Pets Grid */}
        {filteredPets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {pets.length === 0 ? "No pets yet. Add your first pet!" : "No pets match your search."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPets.map((pet) => (
              <Link
                key={pet.id}
                href={`/pets/${pet.id}`}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4">
                  {pet.photoUrl ? (
                    <Image src={pet.photoUrl} alt={pet.name} width={80} height={80} className="rounded-full object-cover" style={{ width: 80, height: 80 }} />
                    ): (undefined)}

                  
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{pet.name}</h2>
                    <p className="text-sm text-gray-500 capitalize">{pet.animalType}</p>
                    <p className="text-sm text-gray-400">Owner: {pet.ownerName}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Add Pet Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#2D4D3A]">Add Pet</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddPet} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Buddy"
                    value={newPet.name}
                    onChange={(e) => {
                      setNewPet({ ...newPet, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                    }}
                    className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A] ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Animal Type *</label>
                  <select
                    value={newPet.animalType}
                    onChange={(e) => {
                      setNewPet({ ...newPet, animalType: e.target.value });
                      if (formErrors.animalType) setFormErrors({ ...formErrors, animalType: "" });
                    }}
                    className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A] ${formErrors.animalType ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select type</option>
                    {animalTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {formErrors.animalType && <p className="text-red-500 text-sm mt-1">{formErrors.animalType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={newPet.dateOfBirth}
                    onChange={(e) => {
                      setNewPet({ ...newPet, dateOfBirth: e.target.value });
                      if (formErrors.dateOfBirth) setFormErrors({ ...formErrors, dateOfBirth: "" });
                    }}
                    className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A] ${formErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    placeholder="e.g., John Smith"
                    value={newPet.ownerName}
                    onChange={(e) => setNewPet({ ...newPet, ownerName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewPet({ ...newPet, photoUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} className="w-full" />  
                </div>

                <button
                  type="submit"
                  disabled={addingPet}
                  className="w-full bg-[#2D4D3A] text-white px-6 py-2 rounded-md hover:bg-[#1f3528] transition disabled:opacity-50"
                >
                  {addingPet ? "Adding..." : "Add Pet"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}