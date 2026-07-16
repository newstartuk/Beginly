import type { JourneyResult, JourneyStage, JourneyTask, MigrationRoute, ReadinessDimension, UserContext } from "./types";
import { buildLegacyChecklistJourneyTasks } from "./legacy-checklist";

const commonTasks: JourneyTask[] = [
  { id: "common-identity", title: "Secure your identity and status records", summary: "Keep your passport, digital status access and core records organised.", route: "all", stage: "settling", category: "Identity", urgency: 100, required: true, dependencies: [], reasonCodes: ["universal_foundation"], estimatedMinutes: 25, sourceIds: ["gov-identity"] },
  { id: "common-gp", title: "Register with a GP", summary: "Find and register with a local GP practice and save the practice details.", route: "all", stage: "settling", category: "Health", urgency: 92, required: true, dependencies: ["common-identity"], reasonCodes: ["health_access"], estimatedMinutes: 35, sourceIds: ["nhs-gp"] },
  { id: "common-bank", title: "Set up an appropriate UK money account", summary: "Compare document requirements and choose an account based on your own needs.", route: "all", stage: "settling", category: "Money", urgency: 80, required: false, dependencies: ["common-identity"], reasonCodes: ["daily_life"], estimatedMinutes: 45, sourceIds: ["fca-guidance"] },
  { id: "common-safety", title: "Save emergency and scam-safety information", summary: "Know how to reach emergency help and recognise common newcomer scams.", route: "all", stage: "settling", category: "Safety", urgency: 88, required: true, dependencies: [], reasonCodes: ["safety"], estimatedMinutes: 15, sourceIds: ["uk-emergency", "action-fraud"] },
  { id: "common-local", title: "Build your local essentials map", summary: "Save transport, council, healthcare, library and support locations.", route: "all", stage: "settling", category: "Local life", urgency: 65, required: false, dependencies: [], reasonCodes: ["city_context"], estimatedMinutes: 30, sourceIds: ["local-authority"] },
];

const routeTasks: Record<MigrationRoute, JourneyTask[]> = {
  student: [
    { id: "student-enrolment", title: "Complete university enrolment", summary: "Confirm enrolment, timetable access and student-status evidence.", route: "student", stage: "studying", category: "Education", urgency: 95, required: true, dependencies: ["common-identity"], reasonCodes: ["student_route"], estimatedMinutes: 45, sourceIds: ["university"] },
    { id: "student-academic-plan", title: "Create an academic success plan", summary: "Map deadlines, support services, study routines and assessment requirements.", route: "student", stage: "studying", category: "Education", urgency: 75, required: false, dependencies: ["student-enrolment"], reasonCodes: ["course_success"], estimatedMinutes: 50, sourceIds: ["university"] },
    { id: "student-experience", title: "Start a UK experience and portfolio plan", summary: "Identify projects, volunteering and placements that build credible evidence.", route: "student", stage: "career_preparation", category: "Career", urgency: 82, required: false, dependencies: ["student-academic-plan"], reasonCodes: ["future_transition", "employment_goal"], estimatedMinutes: 55, futureHorizon: true, sourceIds: ["beginly-career"] },
    { id: "student-cv", title: "Prepare a UK role-specific CV", summary: "Create evidence-led CV material aligned with project-delivery roles.", route: "student", stage: "career_preparation", category: "Career", urgency: 78, required: false, dependencies: ["student-experience"], reasonCodes: ["employment_goal"], estimatedMinutes: 60, futureHorizon: true, sourceIds: ["beginly-career"] },
    { id: "student-sponsor", title: "Understand sponsorship-oriented readiness", summary: "Learn how to research suitable employers and prepare evidence without assuming immigration outcomes.", route: "student", stage: "transition", category: "Transition", urgency: 68, required: false, dependencies: ["student-cv"], reasonCodes: ["long_term_goal"], estimatedMinutes: 45, futureHorizon: true, sourceIds: ["gov-sponsor-list"] },
  ],
  graduate: [
    { id: "graduate-route-review", title: "Review your post-study transition facts", summary: "Confirm graduation, current status facts and deadlines using official sources.", route: "graduate", stage: "transition", category: "Transition", urgency: 100, required: true, dependencies: ["common-identity"], reasonCodes: ["route_transition"], estimatedMinutes: 40, sourceIds: ["gov-immigration"] },
    { id: "graduate-career-positioning", title: "Define your target role and evidence", summary: "Choose role families and map your experience to employer requirements.", route: "graduate", stage: "career_preparation", category: "Career", urgency: 90, required: true, dependencies: [], reasonCodes: ["employment_goal"], estimatedMinutes: 60, sourceIds: ["beginly-career"] },
    { id: "graduate-applications", title: "Build an application and interview rhythm", summary: "Track suitable roles, deadlines, tailored materials and interview practice.", route: "graduate", stage: "transition", category: "Career", urgency: 85, required: false, dependencies: ["graduate-career-positioning"], reasonCodes: ["job_search"], estimatedMinutes: 60, sourceIds: ["beginly-career"] },
  ],
  skilled_worker: [
    { id: "worker-employment-records", title: "Organise employment and sponsorship records", summary: "Keep role, employer, key dates and status evidence clear.", route: "skilled_worker", stage: "established", category: "Work", urgency: 95, required: true, dependencies: ["common-identity"], reasonCodes: ["employment_route"], estimatedMinutes: 40, sourceIds: ["gov-worker"] },
    { id: "worker-progression", title: "Create a professional progression plan", summary: "Map skills, evidence, development and future role options.", route: "skilled_worker", stage: "progression", category: "Career", urgency: 72, required: false, dependencies: [], reasonCodes: ["lifetime_relevance"], estimatedMinutes: 55, sourceIds: ["beginly-career"] },
    { id: "worker-family", title: "Coordinate dependant and family actions", summary: "Assign shared tasks while keeping each adult's private workspace separate.", route: "skilled_worker", stage: "settling", category: "Family", urgency: 75, required: false, dependencies: [], reasonCodes: ["household_context"], estimatedMinutes: 40, sourceIds: ["gov-family"] },
  ],
  health_care: [
    { id: "care-professional-records", title: "Organise role, training and professional records", summary: "Maintain employment, training, competency and development evidence.", route: "health_care", stage: "established", category: "Career", urgency: 90, required: true, dependencies: ["common-identity"], reasonCodes: ["health_care_route"], estimatedMinutes: 50, sourceIds: ["nhs-careers"] },
    { id: "care-progression", title: "Map your healthcare progression route", summary: "Identify development, role progression and regulated-registration possibilities.", route: "health_care", stage: "progression", category: "Career", urgency: 78, required: false, dependencies: ["care-professional-records"], reasonCodes: ["career_progression"], estimatedMinutes: 55, sourceIds: ["nhs-careers"] },
    { id: "care-wellbeing", title: "Set up wellbeing and workplace support", summary: "Save support routes and plan sustainable work routines.", route: "health_care", stage: "established", category: "Wellbeing", urgency: 68, required: false, dependencies: [], reasonCodes: ["workplace_wellbeing"], estimatedMinutes: 30, sourceIds: ["nhs-support"] },
  ],
  family_dependant: [
    { id: "family-shared-plan", title: "Build the household transition plan", summary: "Coordinate health, school, local life and shared deadlines.", route: "family_dependant", stage: "settling", category: "Family", urgency: 95, required: true, dependencies: [], reasonCodes: ["family_route"], estimatedMinutes: 50, sourceIds: ["gov-family"] },
    { id: "family-private-goals", title: "Create your own goals and private workspace", summary: "Define personal career, education or community goals separately from shared household tasks.", route: "family_dependant", stage: "progression", category: "Personal development", urgency: 70, required: false, dependencies: ["family-shared-plan"], reasonCodes: ["member_specific"], estimatedMinutes: 40, sourceIds: ["beginly-family"] },
    { id: "family-career", title: "Prepare for suitable employment or study", summary: "Map transferable skills, evidence, opportunities and support.", route: "family_dependant", stage: "career_preparation", category: "Career", urgency: 72, required: false, dependencies: ["family-private-goals"], reasonCodes: ["employment_goal"], estimatedMinutes: 55, sourceIds: ["beginly-career"] },
  ],
  founder: [
    { id: "founder-thesis", title: "Define the innovation thesis", summary: "State the problem, novelty, beneficiaries and why the approach is hard to replicate.", route: "founder", stage: "progression", category: "Venture", urgency: 96, required: true, dependencies: [], reasonCodes: ["founder_route"], estimatedMinutes: 80, sourceIds: ["beginly-founder"] },
    { id: "founder-evidence", title: "Build the evidence room", summary: "Link requirements to code, tests, market evidence, decisions and outcomes.", route: "founder", stage: "progression", category: "Evidence", urgency: 92, required: true, dependencies: ["founder-thesis"], reasonCodes: ["evidence_readiness"], estimatedMinutes: 90, sourceIds: ["beginly-founder"] },
    { id: "founder-validation", title: "Run measurable market validation", summary: "Define pilots, commercial hypotheses and evidence thresholds.", route: "founder", stage: "progression", category: "Venture", urgency: 88, required: true, dependencies: ["founder-thesis"], reasonCodes: ["viability"], estimatedMinutes: 70, sourceIds: ["beginly-founder"] },
    { id: "founder-scale", title: "Document scalability and operating leverage", summary: "Model technology, distribution, partnerships and capacity triggers.", route: "founder", stage: "progression", category: "Scale", urgency: 76, required: false, dependencies: ["founder-validation"], reasonCodes: ["scalability"], estimatedMinutes: 65, sourceIds: ["beginly-founder"] },
  ],
  global_talent: [
    { id: "talent-evidence", title: "Organise field-recognition evidence", summary: "Map achievements, contributions, impact and independent verification.", route: "global_talent", stage: "progression", category: "Evidence", urgency: 94, required: true, dependencies: [], reasonCodes: ["global_talent_route"], estimatedMinutes: 80, sourceIds: ["gov-global-talent"] },
    { id: "talent-network", title: "Build your UK field network", summary: "Identify credible communities, events, collaborators and opportunities.", route: "global_talent", stage: "progression", category: "Network", urgency: 75, required: false, dependencies: [], reasonCodes: ["field_growth"], estimatedMinutes: 45, sourceIds: ["beginly-network"] },
  ],
  humanitarian: [
    { id: "humanitarian-safe-support", title: "Connect with appropriate support", summary: "Use trusted support routes and avoid relying on generic automated advice for sensitive matters.", route: "humanitarian", stage: "settling", category: "Safety", urgency: 100, required: true, dependencies: [], reasonCodes: ["sensitive_route", "human_review"], estimatedMinutes: 20, sourceIds: ["gov-support"] },
    { id: "humanitarian-local-life", title: "Build a supported local-life plan", summary: "Coordinate health, education, community and essential services with appropriate support.", route: "humanitarian", stage: "settling", category: "Local life", urgency: 85, required: true, dependencies: ["humanitarian-safe-support"], reasonCodes: ["supported_transition"], estimatedMinutes: 45, sourceIds: ["local-authority"] },
  ],
};

const stageOrder: JourneyStage[] = ["pre_arrival", "arrival", "settling", "studying", "career_preparation", "transition", "established", "progression"];

const taskApplies = (task: JourneyTask, context: UserContext): boolean => {
  if (task.route !== "all" && task.route !== context.route) return false;
  if (task.id === "common-bank" && context.profileFacts.some((fact) => fact.key === "bank_account" && fact.value === true)) return false;
  return true;
};

const readinessDimensions = (tasks: JourneyTask[], completed: Set<string>): ReadinessDimension[] => {
  const groups: Array<{ id: string; label: string; categories: string[] }> = [
    { id: "settlement", label: "Settlement", categories: ["Identity", "Health", "Money", "Safety", "Local life"] },
    { id: "journey", label: "Journey readiness", categories: ["Education", "Transition", "Family"] },
    { id: "career", label: "Career and progression", categories: ["Career", "Work", "Personal development", "Network"] },
    { id: "evidence", label: "Evidence and resilience", categories: ["Evidence", "Venture", "Scale", "Wellbeing"] },
  ];
  return groups.map((group) => {
    const relevant = tasks.filter((task) => group.categories.includes(task.category));
    const complete = relevant.filter((task) => completed.has(task.id));
    const score = relevant.length === 0 ? 100 : Math.round((complete.length / relevant.length) * 100);
    return {
      id: group.id,
      label: group.label,
      score,
      explanation: relevant.length === 0 ? "No current actions in this dimension." : `${complete.length} of ${relevant.length} relevant actions complete.`,
      missingTaskIds: relevant.filter((task) => !completed.has(task.id)).map((task) => task.id),
    };
  });
};

export function buildJourney(context: UserContext): JourneyResult {
  const completed = new Set(context.completedTaskIds);
  const legacyChecklistTasks = buildLegacyChecklistJourneyTasks(context);
  const studentAdaptiveTasks = routeTasks.student.filter((task) => task.id !== "student-enrolment");
  const baseTasks =
    context.route === "student" && legacyChecklistTasks.length > 0
      ? [...legacyChecklistTasks, ...studentAdaptiveTasks]
      : [...commonTasks, ...routeTasks[context.route]];
  const tasks = baseTasks
    .filter((task) => taskApplies(task, context))
    .map((task) => ({ ...task, assignedMemberId: task.category === "Family" ? context.activeMemberId : task.assignedMemberId }))
    .sort((a, b) => b.urgency - a.urgency || a.title.localeCompare(b.title));

  const now = Date.now();
  const incomplete = tasks.filter((task) => !completed.has(task.id));
  const eligible = incomplete.filter((task) => {
    const state = context.taskStates[task.id];
    if (state?.state === "irrelevant") return false;
    if (state?.state === "deferred" && state.deferUntil && Date.parse(state.deferUntil) > now) return false;
    return true;
  });
  const dependencyReady = eligible.filter((task) => task.dependencies.every((dependency) => completed.has(dependency)));
  const nextBestActions = dependencyReady.slice(0, 3);
  const currentIndex = stageOrder.indexOf(context.stage);
  const forecast = stageOrder.slice(currentIndex + 1, currentIndex + 4).map((stage) => ({
    stage,
    label: stage.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    reason: stage === "career_preparation" || stage === "transition"
      ? "Beginly prepares this stage early because one or more active goals depend on it."
      : "This is a plausible next stage based on the current route and life context.",
  }));

  return {
    route: context.route,
    stage: context.stage,
    version: "journey-2026.07.1",
    tasks,
    nextBestActions,
    readiness: readinessDimensions(tasks, completed),
    forecast,
    generatedAt: new Date().toISOString(),
    taskStates: context.taskStates,
  };
}
