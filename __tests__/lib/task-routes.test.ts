import { describe, it, expect } from "vitest";
import { taskAppliesToRoute, generateTasksForProfile } from "@/lib/task-generator";
import { buildLegacyChecklistJourneyTasks } from "@/lib/platform/legacy-checklist";
import type { ArrivalProfile, ArrivalType, Task } from "@/types";
import type { UserContext } from "@/lib/platform/types";

const task = (overrides: Partial<Task>): Task => ({
  taskId: "TEST_001",
  title: "Test task",
  summary: "Test",
  stage: "D7",
  category: "Local Admin",
  priority: "High",
  required: true,
  active: true,
  aiHelperAllowed: false,
  estimatedMinutes: 10,
  whatToPrepare: [],
  stepsToTake: [],
  commonMistakes: [],
  whyItMatters: "Test",
  ...overrides,
});

const profile = (arrivalType: ArrivalType): ArrivalProfile => ({
  arrivalType,
  arrivalStatus: "arrived",
  arrivalDate: "2026-11-01",
  city: "London",
  university: "",
  accommodationType: "university_accommodation",
  interestedInWork: true,
  profileCompleted: true,
});

// Tasks about travelling to or landing in the UK, which graduates (already here) shouldn't get.
const ARRIVAL_ONLY = ["UNI_PRE_001", "UNI_PRE_002", "UNI_PRE_003", "UNI_PRE_005", "UNI_D1_001", "UNI_D1_002", "UNI_D1_003", "UNI_D7_002", "UNI_D7_003"];

describe("taskAppliesToRoute", () => {
  it("applies tasks for every route when routes is 'all' or missing", () => {
    expect(taskAppliesToRoute(task({ routes: "all" }), "founder")).toBe(true);
    expect(taskAppliesToRoute(task({ routes: undefined }), "founder")).toBe(true);
  });

  it("applies route-specific tasks only to the routes they name", () => {
    const t = task({ routes: ["skilled_worker", "health_and_care"] });
    expect(taskAppliesToRoute(t, "health_and_care")).toBe(true);
    expect(taskAppliesToRoute(t, "graduate")).toBe(false);
  });

  it("leaves out excluded routes, even for tasks that apply to all routes", () => {
    const t = task({ routes: "all", excludeRoutes: ["graduate"] });
    expect(taskAppliesToRoute(t, "graduate")).toBe(false);
    expect(taskAppliesToRoute(t, "international_student")).toBe(true);
  });
});

describe("graduate checklist", () => {
  const graduateIds = generateTasksForProfile(profile("graduate")).map((t) => t.taskId);
  const studentIds = generateTasksForProfile(profile("international_student")).map((t) => t.taskId);

  it("leaves out the arrival-only shared tasks for graduates", () => {
    for (const id of ARRIVAL_ONLY) expect(graduateIds).not.toContain(id);
  });

  it("still gives those tasks to routes that are arriving", () => {
    for (const id of ARRIVAL_ONLY) expect(studentIds).toContain(id);
  });

  it("keeps the graduate's own replacements and the shared GP task", () => {
    expect(graduateIds).toEqual(expect.arrayContaining(["GRD_D7_004", "GRD_D7_003", "UNI_D7_001"]));
  });
});

describe("Task Library and Journey agree", () => {
  // Platform route name → checklist route name (see lib/platform/route-mapping.ts)
  const ROUTES: Array<[UserContext["route"], ArrivalType]> = [
    ["student", "international_student"],
    ["skilled_worker", "skilled_worker"],
    ["family_dependant", "family_visa"],
    ["graduate", "graduate"],
    ["global_talent", "global_talent"],
    ["health_care", "health_and_care"],
    ["founder", "founder"],
  ];

  it.each(ROUTES)("gives the %s route the same tasks in both places", (route, arrivalType) => {
    const p = profile(arrivalType);
    const library = generateTasksForProfile(p).map((t) => t.taskId);
    const journey = buildLegacyChecklistJourneyTasks({ route, arrivalProfile: p } as unknown as UserContext).map((t) => t.id);

    expect(journey).toEqual(library);
  });
});
