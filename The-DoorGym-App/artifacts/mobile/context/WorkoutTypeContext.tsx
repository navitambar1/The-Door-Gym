import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type WorkoutType = "ES" | "ES+" | "FF" | "FF+";

export interface WorkoutTypePackage {
  code: WorkoutType;
  label: string;
  numericId: number | null;
}

export const PACKAGES: WorkoutTypePackage[] = [
  { code: "ES", label: "Essential Strength", numericId: 5 },
  { code: "ES+", label: "Essential Strength Plus", numericId: 6 },
  { code: "FF", label: "Functional Fitness", numericId: null },
  { code: "FF+", label: "Functional Fitness Plus", numericId: null },
];

interface WorkoutTypeContextValue {
  workoutType: WorkoutType | null;
  hasSeenIntro: boolean;
  hasSeenMedical: boolean;
  isLoading: boolean;
  setWorkoutType: (type: WorkoutType) => Promise<void>;
  setHasSeenIntro: (seen: boolean) => Promise<void>;
  setHasSeenMedical: (seen: boolean) => Promise<void>;
  currentPackage: WorkoutTypePackage | null;
}

const WorkoutTypeContext = createContext<WorkoutTypeContextValue>({
  workoutType: null,
  hasSeenIntro: false,
  hasSeenMedical: false,
  isLoading: true,
  setWorkoutType: async () => {},
  setHasSeenIntro: async () => {},
  setHasSeenMedical: async () => {},
  currentPackage: null,
});

export function WorkoutTypeProvider({ children }: { children: React.ReactNode }) {
  const [workoutType, setWorkoutTypeState] = useState<WorkoutType | null>(null);
  const [hasSeenIntro, setHasSeenIntroState] = useState(false);
  const [hasSeenMedical, setHasSeenMedicalState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [wt, intro, medical] = await Promise.all([
          AsyncStorage.getItem("WorkoutType"),
          AsyncStorage.getItem("HasSeenIntro"),
          AsyncStorage.getItem("HasSeenMedical"),
        ]);
        if (wt && ["ES", "ES+", "FF", "FF+"].includes(wt)) {
          setWorkoutTypeState(wt as WorkoutType);
        }
        setHasSeenIntroState(intro === "true");
        setHasSeenMedicalState(medical === "true");
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const setWorkoutType = async (type: WorkoutType) => {
    setWorkoutTypeState(type);
    await AsyncStorage.setItem("WorkoutType", type);
  };

  const setHasSeenIntro = async (seen: boolean) => {
    setHasSeenIntroState(seen);
    await AsyncStorage.setItem("HasSeenIntro", String(seen));
  };

  const setHasSeenMedical = async (seen: boolean) => {
    setHasSeenMedicalState(seen);
    await AsyncStorage.setItem("HasSeenMedical", String(seen));
  };

  const currentPackage = workoutType
    ? PACKAGES.find(p => p.code === workoutType) ?? null
    : null;

  return (
    <WorkoutTypeContext.Provider
      value={{ workoutType, hasSeenIntro, hasSeenMedical, isLoading, setWorkoutType, setHasSeenIntro, setHasSeenMedical, currentPackage }}
    >
      {children}
    </WorkoutTypeContext.Provider>
  );
}

export function useWorkoutType() {
  return useContext(WorkoutTypeContext);
}
