"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Pet } from "./types";
import Link from "next/link";

interface CalendarEvent {
  type: "birthday" | "vaccine";
  petId: string;
  petName: string;
  label: string;
}

export default function Dashboard() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const totalVaccines = pets.reduce((sum, pet) => sum + pet.vaccines.length, 0);
  const totalAllergies = pets.reduce((sum, pet) => sum + pet.allergies.length, 0);

  // Define Vaccines due soon logic here (e.g., vaccines due in the next 30 days)
  const dueSoon = pets.reduce((count, pet) => {
    const now = new Date();
    const soonThreshold = new Date();
    soonThreshold.setDate(now.getDate() + 30);

    const dueVaccines = pet.vaccines.filter((vaccine) => {
      if (!vaccine.isRecurring || !vaccine.intervalMonths) return false;
      const lastAdministered = new Date(vaccine.dateAdministered);
      const nextDueDate = new Date(lastAdministered);
      nextDueDate.setMonth(lastAdministered.getMonth() + vaccine.intervalMonths);

      return nextDueDate >= now && nextDueDate <= soonThreshold;
    });

    return count + dueVaccines.length;
  }, 0);

  // Calendar logic
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Build events map: day -> events
  const eventsMap = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};

    pets.forEach((pet) => {
      // Birthdays - check if birthday falls in current month
      const dob = new Date(pet.dateOfBirth);
      if (dob.getMonth() === currentMonth) {
        const day = dob.getDate();
        if (!map[day]) map[day] = [];
        map[day].push({
          type: "birthday",
          petId: pet.id,
          petName: pet.name,
          label: `🎂 ${pet.name}'s birthday`,
        });
      }

      // Vaccine due dates
      pet.vaccines.forEach((vaccine) => {
        if (!vaccine.isRecurring || !vaccine.intervalMonths) return;
        const administered = new Date(vaccine.dateAdministered);
        const nextDue = new Date(administered);
        nextDue.setMonth(nextDue.getMonth() + vaccine.intervalMonths);

        if (nextDue.getMonth() === currentMonth && nextDue.getFullYear() === currentYear) {
          const day = nextDue.getDate();
          if (!map[day]) map[day] = [];
          map[day].push({
            type: "vaccine",
            petId: pet.id,
            petName: pet.name,
            label: `💉 ${pet.name}: ${vaccine.name}`,
          });
        }
      });
    });

    return map;
  }, [pets, currentMonth, currentYear]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D4D3A]"></div>
      </div>
    );
  }

  const today = new Date();
  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === currentMonth &&
    today.getFullYear() === currentYear;

  // Generate calendar days
  const calendarDays = [];

  // Empty cells for days before first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-24 bg-gray-50"></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const events = eventsMap[day] || [];

    calendarDays.push(
      <div
        key={day}
        className={`h-24 border border-gray-100 p-1 overflow-hidden ${
          isToday(day) ? "bg-green-50 ring-2 ring-[#2D4D3A]" : "bg-white"
        }`}
      >
        <div className={`text-sm font-medium mb-1 ${isToday(day) ? "text-[#2D4D3A]" : "text-gray-700"}`}>
          {day}
        </div>
        <div className="space-y-0.5 overflow-y-auto max-h-16">
          {events.slice(0, 3).map((event, idx) => (
            <Link
              key={idx}
              href={`/pets/${event.petId}`}
              className={`block text-xs truncate px-1 py-0.5 rounded ${
                event.type === "birthday"
                  ? "bg-pink-100 text-pink-800 hover:bg-pink-200"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
              title={event.label}
            >
              {event.label}
            </Link>
          ))}
          {events.length > 3 && (
            <div className="text-xs text-gray-500 px-1">+{events.length - 3} more</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="text-sm font-medium text-gray-500">Total Pets</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{pets.length}</div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="text-sm font-medium text-gray-500">Vaccines Due Soon</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{dueSoon}</div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="text-sm font-medium text-gray-500">Total Vaccines</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{totalVaccines}</div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="text-sm font-medium text-gray-500">Total Allergies</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{totalAllergies}</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2D4D3A]">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Today
            </button>
            <button
              onClick={goToPrevMonth}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-pink-200"></span>
            <span className="text-gray-600">Birthday</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-200"></span>
            <span className="text-gray-600">Vaccine Due</span>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">{calendarDays}</div>
      </div>
    </div>
  );
}
