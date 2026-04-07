export interface Pet {
  id: string;
  name: string;
  animalType: string;
  dateOfBirth: string;
  ownerName: string;
  photoUrl?: string;
  vaccines: Vaccine[];
  allergies: Allergy[];
}

export interface Vaccine {
  id: string;
  name: string;
  dateAdministered: string;
  isRecurring?: boolean;
  intervalMonths?: number;
}

export interface Allergy {
  id: string;
  name: string;
  severity: "Mild" | "Moderate" | "Severe";
} 