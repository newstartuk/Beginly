import { describe, it, expect, afterEach } from "vitest";
import {
  getUser,
  setUser,
  getArrivalProfile,
  setArrivalProfile,
  getReminderPrefs,
  setReminderPrefs,
  clearAllData,
} from "@/lib/utils";
import type { User, ArrivalProfile } from "@/types";

describe("utils — getUser / setUser", () => {
  afterEach(() => clearAllData());

  it("returns null when no user is stored", () => {
    clearAllData();
    expect(getUser()).toBe(null);
  });

  it("stores and retrieves a user correctly", () => {
    const user: User = {
      id: "test-id",
      name: "Test User",
      email: "test@example.com",
      passwordHash: "hashed",
      createdAt: "2026-01-01",
      profileCompleted: false,
    };
    setUser(user);
    const retrieved = getUser();
    expect(retrieved).toEqual(user);
    expect(retrieved?.name).toBe("Test User");
  });
});

describe("utils — getArrivalProfile / setArrivalProfile", () => {
  afterEach(() => clearAllData());

  it("returns null when no profile is stored", () => {
    clearAllData();
    expect(getArrivalProfile()).toBe(null);
  });

  it("stores and retrieves a profile correctly", () => {
    const profile: ArrivalProfile = {
      arrivalType: "international_student",
      arrivalStatus: "arrived",
      arrivalDate: "2026-03-01",
      city: "London",
      university: "UCL",
      accommodationType: "university_accommodation",
      interestedInWork: false,
      profileCompleted: true,
    };
    setArrivalProfile(profile);
    const retrieved = getArrivalProfile();
    expect(retrieved).toEqual(profile);
    expect(retrieved?.city).toBe("London");
  });
});

describe("utils — getReminderPrefs / setReminderPrefs", () => {
  afterEach(() => clearAllData());

  it("returns default prefs when none stored", () => {
    clearAllData();
    const prefs = getReminderPrefs();
    expect(prefs).toHaveProperty("emailReminders");
    expect(prefs).toHaveProperty("frequency");
    expect(typeof prefs.emailReminders).toBe("boolean");
    expect(typeof prefs.frequency).toBe("string");
  });

  it("stores and retrieves custom prefs correctly", () => {
    setReminderPrefs({ emailReminders: true, frequency: "weekly" });
    const retrieved = getReminderPrefs();
    expect(retrieved.emailReminders).toBe(true);
    expect(retrieved.frequency).toBe("weekly");
  });
});

describe("utils — localStorage corruption handling", () => {
  afterEach(() => clearAllData());

  it("getUser returns null for corrupted localStorage", () => {
    localStorage.setItem("beginly_user", "not valid json {{{");
    expect(getUser()).toBe(null);
    localStorage.removeItem("beginly_user");
  });

  it("getArrivalProfile returns null for corrupted localStorage", () => {
    localStorage.setItem("beginly_profile", "also not json ###");
    expect(getArrivalProfile()).toBe(null);
    localStorage.removeItem("beginly_profile");
  });
});
