"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "../../components/Toast";

interface Vaccine {
  id: string;
  name: string;
  dateAdministered: string;
  isRecurring: boolean;
  intervalMonths?: number;
  documentUrl?: string;
}

interface Allergy {
  id: string;
  name: string;
  reactions: string[];
  severity: "mild" | "severe";
  documentUrl?: string;
}

interface Pet {
  id: string;
  name: string;
  animalType: string;
  dateOfBirth: string;
  ownerName: string;
  photoUrl?: string;
  vaccines: Vaccine[];
  allergies: Allergy[];
}

function calculateNextDue(vaccine: Vaccine): Date | null {
  if (!vaccine.isRecurring || !vaccine.intervalMonths) return null;
  const administered = new Date(vaccine.dateAdministered);
  // Use UTC methods to avoid timezone shifts
  const nextDue = new Date(Date.UTC(
    administered.getUTCFullYear(),
    administered.getUTCMonth() + vaccine.intervalMonths,
    administered.getUTCDate()
  ));
  return nextDue;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function calculateAge(dateOfBirth: string): string {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  
  // Use UTC for birth date to avoid timezone shifts
  const birthYear = birth.getUTCFullYear();
  const birthMonth = birth.getUTCMonth();
  
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();
  
  let years = nowYear - birthYear;
  let months = nowMonth - birthMonth;
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years === 0) {
    return `${months} months`;
  }
  return `${years} years, ${months} months`;
}

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", animalType: "", dateOfBirth: "", ownerName: "", photoUrl: "" });
  const [saving, setSaving] = useState(false);
  
  // Vaccine modal state
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [vaccineForm, setVaccineForm] = useState({ name: "", dateAdministered: "", isRecurring: false, intervalMonths: "", documentUrl: "" });
  const [addingVaccine, setAddingVaccine] = useState(false);
  const [editingVaccineId, setEditingVaccineId] = useState<string | null>(null);
  
  // Allergy modal state
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [allergyForm, setAllergyForm] = useState({ name: "", reactions: "", severity: "mild" as "mild" | "severe", documentUrl: "" });
  const [addingAllergy, setAddingAllergy] = useState(false);
  const [editingAllergyId, setEditingAllergyId] = useState<string | null>(null);

  // Document preview modal state
  const [documentPreview, setDocumentPreview] = useState<{ url: string; title: string } | null>(null);

  // Form error states
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [vaccineErrors, setVaccineErrors] = useState<Record<string, string>>({});
  const [allergyErrors, setAllergyErrors] = useState<Record<string, string>>({});

  const animalTypes = ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Turtle", "Snake", "Other"];

  const fetchPet = useCallback(async () => {
    try {
      const response = await fetch(`/api/pets/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/pets");
          return;
        }
        throw new Error("Failed to fetch pet");
      }
      const data = await response.json();
      setPet(data.pet);
    } catch (err) {
      console.error("Failed to fetch pet:", err);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchPet();
  }, [fetchPet]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/pets/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete pet");
      toast("Pet deleted successfully", "success");
      router.push("/pets");
    } catch (err) {
      toast("Failed to delete pet", "error");
      setDeleting(false);
    }
  };

  const openEditModal = () => {
    if (!pet) return;
    setEditForm({
      name: pet.name,
      animalType: pet.animalType,
      dateOfBirth: new Date(pet.dateOfBirth).toISOString().split("T")[0],
      ownerName: pet.ownerName,
      photoUrl: pet.photoUrl || "",
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const validateEditForm = () => {
    const errors: Record<string, string> = {};
    if (!editForm.name.trim()) errors.name = "Pet name is required";
    if (!editForm.animalType) errors.animalType = "Animal type is required";
    if (!editForm.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!editForm.ownerName.trim()) errors.ownerName = "Owner name is required";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEditForm()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/pets/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          animalType: editForm.animalType,
          dateOfBirth: new Date(editForm.dateOfBirth).toISOString(),
          ownerName: editForm.ownerName,
          photoUrl: editForm.photoUrl,
        }),
      });
      if (!res.ok) throw new Error("Failed to update pet");
      setShowEditModal(false);
      toast("Pet updated successfully", "success");
      await fetchPet();
    } catch (err) {
      toast("Failed to update pet", "error");
    } finally {
      setSaving(false);
    }
  };

  const validateVaccineForm = () => {
    const errors: Record<string, string> = {};
    if (!vaccineForm.name.trim()) errors.name = "Vaccine name is required";
    if (!vaccineForm.dateAdministered) errors.dateAdministered = "Date is required";
    if (vaccineForm.isRecurring && !vaccineForm.intervalMonths) errors.intervalMonths = "Interval is required";
    setVaccineErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateVaccineForm()) return;
    setAddingVaccine(true);
    try {
      const url = editingVaccineId 
        ? `/api/pets/${params.id}/vaccines/${editingVaccineId}`
        : `/api/pets/${params.id}/vaccines`;
      const res = await fetch(url, {
        method: editingVaccineId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: vaccineForm.name,
          dateAdministered: new Date(vaccineForm.dateAdministered).toISOString(),
          isRecurring: vaccineForm.isRecurring,
          intervalMonths: vaccineForm.intervalMonths ? parseInt(vaccineForm.intervalMonths) : undefined,
          documentUrl: vaccineForm.documentUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to save vaccine");
      closeVaccineModal();
      toast(editingVaccineId ? "Vaccine updated" : "Vaccine added", "success");
      await fetchPet();
    } catch (err) {
      toast("Failed to save vaccine", "error");
    } finally {
      setAddingVaccine(false);
    }
  };

  const openEditVaccine = (vaccine: Vaccine) => {
    setEditingVaccineId(vaccine.id);
    setVaccineForm({
      name: vaccine.name,
      dateAdministered: new Date(vaccine.dateAdministered).toISOString().split("T")[0],
      isRecurring: vaccine.isRecurring,
      intervalMonths: vaccine.intervalMonths?.toString() || "",
      documentUrl: vaccine.documentUrl || "",
    });
    setVaccineErrors({});
    setShowVaccineModal(true);
  };

  const closeVaccineModal = () => {
    setShowVaccineModal(false);
    setEditingVaccineId(null);
    setVaccineForm({ name: "", dateAdministered: "", isRecurring: false, intervalMonths: "", documentUrl: "" });
    setVaccineErrors({});
  };

  const handleDeleteVaccine = async (vaccineId: string) => {
    if (!confirm("Delete this vaccine record?")) return;
    try {
      const res = await fetch(`/api/pets/${params.id}/vaccines/${vaccineId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete vaccine");
      toast("Vaccine deleted", "success");
      await fetchPet();
    } catch (err) {
      toast("Failed to delete vaccine", "error");
    }
  };

  const validateAllergyForm = () => {
    const errors: Record<string, string> = {};
    if (!allergyForm.name.trim()) errors.name = "Allergy name is required";
    setAllergyErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAllergyForm()) return;
    setAddingAllergy(true);
    try {
      const url = editingAllergyId
        ? `/api/pets/${params.id}/allergies/${editingAllergyId}`
        : `/api/pets/${params.id}/allergies`;
      const res = await fetch(url, {
        method: editingAllergyId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: allergyForm.name,
          reactions: allergyForm.reactions ? allergyForm.reactions.split(",").map(r => r.trim()).filter(Boolean) : [],
          severity: allergyForm.severity,
          documentUrl: allergyForm.documentUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to save allergy");
      closeAllergyModal();
      toast(editingAllergyId ? "Allergy updated" : "Allergy added", "success");
      await fetchPet();
    } catch (err) {
      toast("Failed to save allergy", "error");
    } finally {
      setAddingAllergy(false);
    }
  };

  const openEditAllergy = (allergy: Allergy) => {
    setEditingAllergyId(allergy.id);
    setAllergyForm({
      name: allergy.name,
      reactions: allergy.reactions.join(", "),
      severity: allergy.severity,
      documentUrl: allergy.documentUrl || "",
    });
    setAllergyErrors({});
    setShowAllergyModal(true);
  };

  const closeAllergyModal = () => {
    setShowAllergyModal(false);
    setEditingAllergyId(null);
    setAllergyForm({ name: "", reactions: "", severity: "mild", documentUrl: "" });
    setAllergyErrors({});
  };

  const handleDeleteAllergy = async (allergyId: string) => {
    if (!confirm("Delete this allergy record?")) return;
    try {
      const res = await fetch(`/api/pets/${params.id}/allergies/${allergyId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete allergy");
      toast("Allergy deleted", "success");
      await fetchPet();
    } catch (err) {
      toast("Failed to delete allergy", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D4D3A]"></div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Pet not found</div>
      </div>
    );
  }

  // Find upcoming vaccines
  const upcomingVaccines = pet.vaccines
    .map((v) => ({ ...v, nextDue: calculateNextDue(v) }))
    .filter((v) => v.nextDue !== null)
    .sort((a, b) => (a.nextDue!.getTime() - b.nextDue!.getTime()));

  const overdueVaccines = upcomingVaccines.filter((v) => v.nextDue! < new Date());

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link href="/pets" className="text-[#2D4D3A] hover:underline mb-6 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Pets
        </Link>

        {/* Pet Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {pet.photoUrl ? (
              <Image
                src={pet.photoUrl}
                alt={pet.name}
                width={120}
                height={120}
                className="rounded-full object-cover"
                style={{ width: 120, height: 120 }}
              />
            ) : (
              <div className="w-[120px] h-[120px] rounded-full bg-gray-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-semibold text-[#2D4D3A]">{pet.name}</h1>
                  <p className="text-gray-500 capitalize">{pet.animalType}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={openEditModal}
                    className="text-[#2D4D3A] hover:text-[#1f3528] p-2"
                    title="Edit pet"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Delete pet"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Age:</span>
                  <span className="ml-2 text-gray-800">{calculateAge(pet.dateOfBirth)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date of Birth:</span>
                  <span className="ml-2 text-gray-800">{formatDate(pet.dateOfBirth)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Owner:</span>
                  <span className="ml-2 text-gray-800">{pet.ownerName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Vaccines Alert */}
        {overdueVaccines.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Overdue Vaccines
            </h3>
            <ul className="mt-2 space-y-1">
              {overdueVaccines.map((v) => (
                <li key={v.id} className="text-red-700 text-sm">
                  {v.name} - was due {formatDate(v.nextDue!.toISOString())}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vaccines Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#2D4D3A] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Vaccines
              </h2>
              <button
                onClick={() => setShowVaccineModal(true)}
                className="text-[#2D4D3A] hover:text-[#1f3528] p-1"
                title="Add vaccine"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            {pet.vaccines.length === 0 ? (
              <p className="text-gray-500 text-sm">No vaccines recorded</p>
            ) : (
              <ul className="space-y-3">
                {pet.vaccines.map((vaccine) => {
                  const nextDue = calculateNextDue(vaccine);
                  const isOverdue = nextDue && nextDue < new Date();
                  
                  return (
                    <li key={vaccine.id} className="border-b border-gray-100 pb-3 last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{vaccine.name}</p>
                          <p className="text-sm text-gray-500">
                            Administered: {formatDate(vaccine.dateAdministered)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {vaccine.isRecurring && vaccine.intervalMonths && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1">
                              Every {vaccine.intervalMonths} mo
                            </span>
                          )}
                          <button onClick={() => openEditVaccine(vaccine)} className="text-gray-400 hover:text-[#2D4D3A] p-1" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteVaccine(vaccine.id)} className="text-gray-400 hover:text-red-500 p-1" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {nextDue && (
                        <p className={`text-sm mt-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                          {isOverdue ? 'Overdue since' : 'Next due'}: {formatDate(nextDue.toISOString())}
                        </p>
                      )}
                      {vaccine.documentUrl && (
                        <button 
                          onClick={() => setDocumentPreview({ url: vaccine.documentUrl!, title: `${vaccine.name} - Vaccine Document` })}
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          View document
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Allergies Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#2D4D3A] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Allergies
              </h2>
              <button
                onClick={() => setShowAllergyModal(true)}
                className="text-[#2D4D3A] hover:text-[#1f3528] p-1"
                title="Add allergy"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            {pet.allergies.length === 0 ? (
              <p className="text-gray-500 text-sm">No allergies recorded</p>
            ) : (
              <ul className="space-y-3">
                {pet.allergies.map((allergy) => (
                  <li key={allergy.id} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{allergy.name}</p>
                        {allergy.reactions.length > 0 && (
                          <p className="text-sm text-gray-500 mt-1">
                            Reactions: {allergy.reactions.join(", ")}
                          </p>
                        )}
                        {allergy.documentUrl && (
                          <button 
                            onClick={() => setDocumentPreview({ url: allergy.documentUrl!, title: `${allergy.name} - Allergy Document` })}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            View document
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-1 rounded mr-1 ${
                          allergy.severity === 'severe' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {allergy.severity}
                        </span>
                        <button onClick={() => openEditAllergy(allergy)} className="text-gray-400 hover:text-[#2D4D3A] p-1" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteAllergy(allergy.id)} className="text-gray-400 hover:text-red-500 p-1" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Upcoming Vaccines */}
        {upcomingVaccines.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-[#2D4D3A] mb-4">Vaccine Schedule</h2>
            
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">Vaccine</th>
                    <th className="text-left py-2 text-gray-600">Last Given</th>
                    <th className="text-left py-2 text-gray-600">Next Due</th>
                    <th className="text-left py-2 text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingVaccines.map((v) => {
                    const isOverdue = v.nextDue! < new Date();
                    const daysUntil = Math.floor((v.nextDue!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <tr key={v.id} className="border-b border-gray-100">
                        <td className="py-3 font-medium">{v.name}</td>
                        <td className="py-3 text-gray-500">{formatDate(v.dateAdministered)}</td>
                        <td className="py-3 text-gray-500">{formatDate(v.nextDue!.toISOString())}</td>
                        <td className="py-3">
                          {isOverdue ? (
                            <span className="text-red-600 font-medium">Overdue</span>
                          ) : daysUntil <= 30 ? (
                            <span className="text-yellow-600">Due in {daysUntil} days</span>
                          ) : (
                            <span className="text-green-600">Up to date</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-4">
              {upcomingVaccines.map((v) => {
                const isOverdue = v.nextDue! < new Date();
                const daysUntil = Math.floor((v.nextDue!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={v.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800">{v.name}</h3>
                      {isOverdue ? (
                        <span className="text-red-600 font-medium text-sm">Overdue</span>
                      ) : daysUntil <= 30 ? (
                        <span className="text-yellow-600 text-sm">Due in {daysUntil} days</span>
                      ) : (
                        <span className="text-green-600 text-sm">Up to date</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p><span className="text-gray-600">Last Given:</span> {formatDate(v.dateAdministered)}</p>
                      <p><span className="text-gray-600">Next Due:</span> {formatDate(v.nextDue!.toISOString())}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Edit Pet Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#2D4D3A]">Edit Pet</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Animal Type *</label>
                  <select
                    value={editForm.animalType}
                    onChange={(e) => setEditForm({ ...editForm, animalType: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A]"
                    required
                  >
                    <option value="">Select type</option>
                    {animalTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    value={editForm.ownerName}
                    onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditForm({ ...editForm, photoUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} className="w-full" />  
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#2D4D3A] text-white px-4 py-2 rounded-md hover:bg-[#1f3528] disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Vaccine Modal */}
        {showVaccineModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#2D4D3A]">{editingVaccineId ? "Edit Vaccine" : "Add Vaccine"}</h2>
                <button
                  onClick={closeVaccineModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddVaccine} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Rabies"
                    value={vaccineForm.name}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Administered *</label>
                  <input
                    type="date"
                    value={vaccineForm.dateAdministered}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, dateAdministered: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A]"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={vaccineForm.isRecurring}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, isRecurring: e.target.checked })}
                    className="h-4 w-4 text-[#2D4D3A] rounded"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">Recurring vaccine</label>
                </div>

                {vaccineForm.isRecurring && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interval (months) *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g., 12"
                      value={vaccineForm.intervalMonths}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, intervalMonths: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A]"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document (optional)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setVaccineForm({ ...vaccineForm, documentUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm"
                  />
                  {vaccineForm.documentUrl && (
                    <p className="text-xs text-green-600 mt-1">Document attached</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeVaccineModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={addingVaccine}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingVaccine}
                    className="flex-1 bg-[#2D4D3A] text-white px-4 py-2 rounded-md hover:bg-[#1f3528] disabled:opacity-50"
                  >
                    {addingVaccine ? "Saving..." : (editingVaccineId ? "Save Changes" : "Add Vaccine")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Allergy Modal */}
        {showAllergyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#2D4D3A]">{editingAllergyId ? "Edit Allergy" : "Add Allergy"}</h2>
                <button
                  onClick={closeAllergyModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddAllergy} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergy Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Peanuts"
                    value={allergyForm.name}
                    onChange={(e) => setAllergyForm({ ...allergyForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reactions (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., Itching, Swelling, Hives"
                    value={allergyForm.reactions}
                    onChange={(e) => setAllergyForm({ ...allergyForm, reactions: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
                  <select
                    value={allergyForm.severity}
                    onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value as "mild" | "severe" })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2D4D3A]"
                    required
                  >
                    <option value="mild">Mild</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document (optional)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAllergyForm({ ...allergyForm, documentUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm"
                  />
                  {allergyForm.documentUrl && (
                    <p className="text-xs text-green-600 mt-1">Document attached</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeAllergyModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={addingAllergy}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingAllergy}
                    className="flex-1 bg-[#2D4D3A] text-white px-4 py-2 rounded-md hover:bg-[#1f3528] disabled:opacity-50"
                  >
                    {addingAllergy ? "Saving..." : (editingAllergyId ? "Save Changes" : "Add Allergy")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Delete {pet.name}?</h2>
              <p className="text-gray-600 mb-6">
                This will permanently delete this pet and all associated medical records. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {documentPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setDocumentPreview(null)}>
            <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">{documentPreview.title}</h2>
                <button
                  onClick={() => setDocumentPreview(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {documentPreview.url.startsWith('data:application/pdf') ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mb-4">PDF Document</p>
                  <a
                    href={documentPreview.url}
                    download={`${documentPreview.title}.pdf`}
                    className="inline-flex items-center gap-2 bg-[#2D4D3A] text-white px-4 py-2 rounded-md hover:bg-[#1f3528]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </a>
                </div>
              ) : (
                <img 
                  src={documentPreview.url} 
                  alt={documentPreview.title}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
