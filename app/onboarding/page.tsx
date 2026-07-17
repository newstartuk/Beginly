"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ensureBeginlyUser } from "@/lib/auth-client";
import { generateTasksForProfile } from "@/lib/task-generator";
import type { ArrivalProfile, ArrivalType, AccommodationType, UserTask } from "@/types";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  Home,
  CheckCircle,
  Car,
  Users,
  Briefcase,
  Building2,
} from "lucide-react";

const CITIES = [
  "London", "Birmingham", "Manchester", "Glasgow", "Edinburgh",
  "Leeds", "Liverpool", "Bristol", "Sheffield", "Newcastle",
  "Nottingham", "Southampton", "Cardiff", "Belfast", "Other",
];

const CITY_UNIVERSITIES: Record<string, string[]> = {
  London: [
    "Imperial College London", "King's College London", "London School of Economics",
    "University College London", "City, University of London",
    "Queen Mary University of London", "Royal Holloway, University of London",
    "Brunel University London", "University of the Arts London",
    "London South Bank University", "Goldsmiths, University of London",
  ],
  Birmingham: [
    "University of Birmingham", "Aston University",
    "Birmingham City University", "Newman University",
  ],
  Manchester: ["University of Manchester", "Manchester Metropolitan University"],
  Glasgow: [
    "University of Glasgow", "University of Strathclyde",
    "Glasgow Caledonian University",
  ],
  Edinburgh: [
    "University of Edinburgh", "Edinburgh Napier University",
    "Heriot-Watt University", "Queen Margaret University",
  ],
  Leeds: ["University of Leeds", "Leeds Beckett University", "Leeds Arts University"],
  Liverpool: [
    "University of Liverpool", "Liverpool John Moores University",
    "Liverpool Hope University",
  ],
  Bristol: ["University of Bristol", "University of the West of England"],
  Sheffield: ["University of Sheffield", "Sheffield Hallam University"],
  Newcastle: ["Newcastle University", "Northumbria University", "University of Sunderland"],
  Nottingham: ["University of Nottingham", "Nottingham Trent University"],
  Southampton: ["University of Southampton", "Solent University"],
  Cardiff: [
    "Cardiff University", "Cardiff Metropolitan University",
    "University of South Wales",
  ],
  Belfast: ["Queen's University Belfast", "Ulster University"],
  Other: [
    "University of Oxford", "University of Cambridge", "Durham University",
    "University of Warwick", "University of Exeter", "University of Bath",
    "University of York", "University of Leicester", "Loughborough University",
    "University of Reading", "University of Surrey",
  ],
};

const ROUTE_OPTIONS: { value: ArrivalType; label: string; desc: string }[] = [
  { value: "skilled_worker", label: "Skilled Worker", desc: "Working in the UK on a Skilled Worker visa" },
  { value: "health_and_care", label: "Health & Care Worker", desc: "Working for the NHS or UK adult social care" },
  { value: "international_student", label: "International Student", desc: "Coming to study at a UK university" },
  { value: "graduate", label: "Graduate Route", desc: "Staying in the UK after completing a UK degree" },
  { value: "family_visa", label: "Family Visa", desc: "Joining family already in the UK" },
  { value: "global_talent", label: "Global Talent", desc: "Endorsed by Tech Nation, Royal Academy, or British Academy" },
  { value: "founder", label: "Innovator Founder", desc: "Starting or running a business with endorsement" },
];

const HOUSING_OPTIONS: { value: AccommodationType; label: string; desc: string; councilTax: boolean }[] = [
  { value: "private_rental", label: "Renting privately", desc: "Renting from a landlord or letting agent", councilTax: true },
  { value: "own_home", label: "Own my home", desc: "I have bought or am buying a property", councilTax: true },
  { value: "employer_provided", label: "Employer-provided accommodation", desc: "My employer is providing housing", councilTax: false },
  { value: "family_friend", label: "Living with family or friends", desc: "Staying with someone I know", councilTax: false },
  { value: "university_accommodation", label: "University halls of residence", desc: "On-campus student accommodation", councilTax: false },
  { value: "homestay", label: "Homestay", desc: "Living with a host family — meals included", councilTax: false },
  { value: "temporary", label: "Temporary (hotel / Airbnb)", desc: "Short-term while I find somewhere permanent", councilTax: false },
  { value: "not_secured", label: "Not yet arranged", desc: "I still need to find accommodation", councilTax: false },
];

const UK_SECTORS = [
  "Healthcare & Social Care",
  "Technology & Software",
  "Finance & Banking",
  "Engineering & Manufacturing",
  "Education & Research",
  "Creative & Media",
  "Legal & Professional Services",
  "Retail & Hospitality",
  "Construction & Property",
  "Transport & Logistics",
  "Science & Pharmaceuticals",
  "Public Sector & Government",
  "Other",
];

type OnboardingProfile = Partial<ArrivalProfile>;

const STEPS = [
  { label: "Route", icon: User },
  { label: "Status", icon: Calendar },
  { label: "Location", icon: MapPin },
  { label: "Housing", icon: Home },
  { label: "Driving", icon: Car },
  { label: "Dependants", icon: Users },
  { label: "Sector", icon: Briefcase },
  { label: "Employer", icon: Building2 },
  { label: "Done", icon: CheckCircle },
];

const STORAGE_KEY = "beginly_onboarding_v2";

function save(state: { step: number; profile: OnboardingProfile }) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function load(): { step: number; profile: OnboardingProfile } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.step === "number" ? parsed : null;
  } catch { return null; }
}

function clear() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

function isStudent(profile: OnboardingProfile) {
  return profile.arrivalType === "international_student";
}

function isFounder(profile: OnboardingProfile) {
  return profile.arrivalType === "founder";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showNotifBanner, setShowNotifBanner] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile>({
    arrivalType: undefined,
    arrivalStatus: "not_arrived",
    interestedInWork: false,
    profileCompleted: false,
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/signup"); return; }
      setAuthChecked(true);

      const { data: profileData } = await supabase
        .from("arrival_profiles")
        .select("arrival_type")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profileData) { router.push("/platform"); return; }

      const saved = load();
      if (saved) {
        setStep(saved.step);
        setProfile((p) => ({ ...p, ...saved.profile }));
      }
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    save({ step, profile });
  }, [step, profile, authChecked]);

  const update = <K extends keyof ArrivalProfile>(key: K, value: ArrivalProfile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const totalSteps = STEPS.length;
  const next = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const isLastStep = step === totalSteps - 1;

  const canProceed = () => {
    if (step === 0) return Boolean(profile.arrivalType);
    if (step === 1) return Boolean(profile.arrivalStatus);
    if (step === 2) return Boolean(profile.city) && (isStudent(profile) ? Boolean(profile.university) : true);
    return true;
  };

  const handleFinish = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); router.push("/login"); return; }

    const completeProfile: ArrivalProfile = {
      arrivalType: profile.arrivalType ?? "skilled_worker",
      arrivalStatus: profile.arrivalStatus ?? "not_arrived",
      arrivalDate: profile.arrivalDate ?? "",
      city: profile.city ?? "",
      university: profile.university ?? "",
      accommodationType: profile.accommodationType ?? "not_secured",
      nationality: profile.nationality,
      englishLevel: profile.englishLevel,
      interestedInWork: Boolean(profile.interestedInWork),
      profileCompleted: true,
      drivesFromOrigin: profile.drivesFromOrigin,
      hasIDL: profile.hasIDL,
      hasDependants: profile.hasDependants,
      sector: profile.sector,
      employerName: profile.employerName,
    };

    await ensureBeginlyUser();

    // Try to save with new extended columns first, fall back to core columns
    const extendedPayload: Record<string, unknown> = {
      user_id: user.id,
      arrival_type: completeProfile.arrivalType,
      status: completeProfile.arrivalStatus,
      arrival_date: completeProfile.arrivalDate || null,
      city: completeProfile.city || null,
      university: completeProfile.university || null,
      accommodation: completeProfile.accommodationType,
      nationality: completeProfile.nationality || null,
      english_level: completeProfile.englishLevel || null,
      work_interest: completeProfile.interestedInWork,
      drives_from_origin: completeProfile.drivesFromOrigin ?? null,
      has_idl: completeProfile.hasIDL ?? null,
      has_dependants: completeProfile.hasDependants ?? null,
      sector: completeProfile.sector || null,
      employer_name: completeProfile.employerName || null,
    };

    const { data: existingProfile } = await supabase
      .from("arrival_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let profileError: { message: string } | null = null;

    if (existingProfile) {
      const { error } = await supabase.from("arrival_profiles").update(extendedPayload).eq("user_id", user.id);
      profileError = error;
    } else {
      const { error } = await supabase.from("arrival_profiles").insert(extendedPayload);
      profileError = error;
    }

    if (profileError) {
      // New columns may not exist yet — fall back to core fields only
      const corePayload = {
        user_id: user.id,
        arrival_type: completeProfile.arrivalType,
        status: completeProfile.arrivalStatus,
        arrival_date: completeProfile.arrivalDate || null,
        city: completeProfile.city || null,
        university: completeProfile.university || null,
        accommodation: completeProfile.accommodationType,
        nationality: completeProfile.nationality || null,
        english_level: completeProfile.englishLevel || null,
        work_interest: completeProfile.interestedInWork,
      };
      const { error: fallbackError } = existingProfile
        ? await supabase.from("arrival_profiles").update(corePayload).eq("user_id", user.id)
        : await supabase.from("arrival_profiles").insert(corePayload);
      if (fallbackError) {
        console.error("Profile save failed:", fallbackError.message);
        setLoading(false);
        return;
      }
    }

    const generatedTasks = generateTasksForProfile(completeProfile);
    const { data: existingRows } = await supabase
      .from("user_tasks")
      .select("task_id,status,completed_at")
      .eq("user_id", user.id);

    const existing = new Set((existingRows ?? []).map((row) => row.task_id));
    const rowsToInsert = generatedTasks
      .filter((task: UserTask) => !existing.has(task.taskId))
      .map((task: UserTask) => ({
        user_id: user.id,
        task_id: task.taskId,
        status: task.status,
        completed_at: null,
      }));

    if (rowsToInsert.length) {
      const { error: taskError } = await supabase.from("user_tasks").insert(rowsToInsert);
      if (taskError) console.error("Task insert failed:", taskError.message);
    }

    await supabase.from("users").update({ profile_completed: true }).eq("id", user.id);

    clear();
    await new Promise((r) => setTimeout(r, 400));

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      setShowNotifBanner(true);
    } else {
      router.push("/platform");
    }
    setLoading(false);
  };

  const finishWithNotifs = async (permission: NotificationPermission) => {
    try { localStorage.setItem("beginly_notification_permission", permission); } catch { /* ignore */ }
    setShowNotifBanner(false);
    await new Promise((r) => setTimeout(r, 200));
    router.push("/platform");
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) { finishWithNotifs("denied"); return; }
    const perm = await Notification.requestPermission();
    finishWithNotifs(perm);
  };

  if (!authChecked) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-navy">Set up your settlement roadmap</h1>
          <p className="text-sm text-muted mt-1">Step {step + 1} of {totalSteps} — takes about 3 minutes</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-civic-100"}`}
            />
          ))}
        </div>

        <div className="card space-y-4">

          {/* Step 0 — Route */}
          {step === 0 && (
            <div className="space-y-3">
              <label className="input-label">I am coming to the UK as a...</label>
              {ROUTE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("arrivalType", opt.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    profile.arrivalType === opt.value
                      ? "border-primary bg-teal-50"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="text-sm font-semibold text-navy">{opt.label}</p>
                  <p className="text-xs text-muted">{opt.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 1 — Arrival status & date */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="input-label">What is your arrival status?</label>
                <div className="space-y-2 mt-1">
                  {[
                    { value: "not_arrived", label: "Not arrived yet", desc: "Planning my journey" },
                    { value: "arriving_soon", label: "Arriving within the next 2 weeks", desc: "Very soon!" },
                    { value: "arrived", label: "Already arrived in the UK", desc: "Just started settling in" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("arrivalStatus", opt.value as ArrivalProfile["arrivalStatus"])}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        profile.arrivalStatus === opt.value
                          ? "border-primary bg-teal-50"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <p className="text-sm font-semibold text-navy">{opt.label}</p>
                      <p className="text-xs text-muted">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              {profile.arrivalStatus !== "not_arrived" && (
                <div>
                  <label className="input-label">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Expected or actual arrival date
                  </label>
                  <input
                    type="date"
                    value={profile.arrivalDate || ""}
                    onChange={(e) => update("arrivalDate", e.target.value)}
                    className="input-field"
                    max={profile.arrivalStatus === "arrived" ? new Date().toISOString().split("T")[0] : undefined}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2 — City (+ university for students) */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="input-label">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Which city are you going to?
                </label>
                <select
                  value={profile.city || ""}
                  onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value, university: "" }))}
                  className="select-field"
                >
                  <option value="">Select your city...</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {isStudent(profile) && (
                <div>
                  <label className="input-label">Which university?</label>
                  <select
                    value={profile.university || ""}
                    onChange={(e) => update("university", e.target.value)}
                    className="select-field"
                    disabled={!profile.city}
                  >
                    <option value="">{profile.city ? "Select your university..." : "Select a city first"}</option>
                    {(CITY_UNIVERSITIES[profile.city ?? ""] ?? []).map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}
              {!isStudent(profile) && profile.city && (
                <p className="text-xs text-muted bg-civic-50 rounded-lg p-3">
                  Your city helps us show you local resources, GP surgeries, and council information.
                </p>
              )}
            </div>
          )}

          {/* Step 3 — Housing */}
          {step === 3 && (
            <div className="space-y-3">
              <label className="input-label">
                <Home className="w-3 h-3 inline mr-1" />
                What type of accommodation do you have?
              </label>
              <p className="text-xs text-muted">This determines whether council tax applies to you.</p>
              {HOUSING_OPTIONS.filter((opt) =>
                isStudent(profile) ? true : opt.value !== "university_accommodation"
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("accommodationType", opt.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    profile.accommodationType === opt.value
                      ? "border-primary bg-teal-50"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-navy">{opt.label}</p>
                      <p className="text-xs text-muted">{opt.desc}</p>
                    </div>
                    {opt.councilTax && (
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 shrink-0 mt-0.5">
                        Council tax applies
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 4 — Driving */}
          {step === 4 && (
            <div className="space-y-4">
              <label className="input-label">
                <Car className="w-3 h-3 inline mr-1" />
                Do you hold a driving licence from your home country?
              </label>
              <div className="space-y-2">
                {[
                  { value: true, label: "Yes, I drive and hold a licence", desc: "We'll add a DVLA licence exchange task to your roadmap" },
                  { value: false, label: "No, I don't drive", desc: "No driving tasks will be added" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => update("drivesFromOrigin", opt.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      profile.drivesFromOrigin === opt.value
                        ? "border-primary bg-teal-50"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-navy">{opt.label}</p>
                    <p className="text-xs text-muted">{opt.desc}</p>
                  </button>
                ))}
              </div>
              {profile.drivesFromOrigin === true && (
                <div className="space-y-2">
                  <label className="input-label">Do you also have an International Driving Permit (IDP)?</label>
                  {[
                    { value: true, label: "Yes, I have an IDP", desc: "Recommended for driving in the UK on an overseas licence" },
                    { value: false, label: "No IDP", desc: "You can still drive on your overseas licence for up to 12 months" },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => update("hasIDL", opt.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        profile.hasIDL === opt.value
                          ? "border-primary bg-teal-50"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <p className="text-sm font-semibold text-navy">{opt.label}</p>
                      <p className="text-xs text-muted">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              )}
              <button type="button" onClick={next} className="btn-ghost text-xs text-muted w-full justify-center">
                Skip this question
              </button>
            </div>
          )}

          {/* Step 5 — Dependants */}
          {step === 5 && (
            <div className="space-y-3">
              <label className="input-label">
                <Users className="w-3 h-3 inline mr-1" />
                Are you bringing children or other dependants to the UK?
              </label>
              <p className="text-xs text-muted">This helps us add tasks like school enrolment to your roadmap where relevant.</p>
              {[
                { value: true, label: "Yes, I have children or dependants coming with me", desc: "We'll add school enrolment and family settlement tasks" },
                { value: false, label: "No dependants — just me (or adults only)", desc: "No dependant-specific tasks will be added" },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => update("hasDependants", opt.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    profile.hasDependants === opt.value
                      ? "border-primary bg-teal-50"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="text-sm font-semibold text-navy">{opt.label}</p>
                  <p className="text-xs text-muted">{opt.desc}</p>
                </button>
              ))}
              <button type="button" onClick={next} className="btn-ghost text-xs text-muted w-full justify-center">
                Skip this question
              </button>
            </div>
          )}

          {/* Step 6 — Sector */}
          {step === 6 && (
            <div className="space-y-4">
              <label className="input-label">
                <Briefcase className="w-3 h-3 inline mr-1" />
                {isStudent(profile) ? "What are you studying? (optional)" : "What sector are you working in? (optional)"}
              </label>
              <select
                value={profile.sector || ""}
                onChange={(e) => update("sector", e.target.value)}
                className="select-field"
              >
                <option value="">
                  {isStudent(profile) ? "Select your field of study..." : "Select your sector..."}
                </option>
                {UK_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="button" onClick={next} className="btn-ghost text-xs text-muted w-full justify-center">
                Skip this question
              </button>
            </div>
          )}

          {/* Step 7 — Employer / company name */}
          {step === 7 && (
            <div className="space-y-4">
              <label className="input-label">
                <Building2 className="w-3 h-3 inline mr-1" />
                {isFounder(profile)
                  ? "What is your company name? (optional)"
                  : isStudent(profile)
                  ? "Which university are you attending? (optional)"
                  : "What is your employer's name? (optional)"}
              </label>
              <input
                type="text"
                value={profile.employerName || ""}
                onChange={(e) => update("employerName", e.target.value)}
                className="input-field"
                placeholder={
                  isFounder(profile)
                    ? "e.g. Acme Technologies Ltd"
                    : isStudent(profile)
                    ? "e.g. University of Manchester"
                    : "e.g. NHS Greater Manchester"
                }
              />
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <p className="text-sm font-semibold text-navy">Meet Nia — your AI settlement guide</p>
                </div>
                <p className="text-xs text-civic-600 leading-relaxed">
                  As you work through your roadmap, you can chat with <strong>Nia</strong> — she can explain tasks, point you to official sources, and help you navigate UK daily life.
                </p>
                <p className="text-xs text-civic-500 leading-relaxed">
                  <strong className="text-amber-600">Note:</strong> Nia is an AI orientation tool, not a regulated adviser. For immigration, legal, or financial advice, speak to a qualified professional.
                </p>
              </div>
              <button type="button" onClick={next} className="btn-ghost text-xs text-muted w-full justify-center">
                Skip this question
              </button>
            </div>
          )}

          {/* Step 8 — Review & finish */}
          {step === 8 && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <CheckCircle className="w-10 h-10 text-primary mx-auto mb-2" />
                <p className="text-base font-bold text-navy">Ready to build your roadmap</p>
                <p className="text-sm text-muted mt-1">
                  We&apos;ll create a personalised settlement checklist based on your answers.
                </p>
              </div>
              <div className="bg-civic-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Route</span>
                  <span className="font-medium text-navy capitalize">
                    {ROUTE_OPTIONS.find((r) => r.value === profile.arrivalType)?.label ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">City</span>
                  <span className="font-medium text-navy">{profile.city || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Housing</span>
                  <span className="font-medium text-navy capitalize">
                    {HOUSING_OPTIONS.find((h) => h.value === profile.accommodationType)?.label ?? "—"}
                  </span>
                </div>
                {profile.sector && (
                  <div className="flex justify-between">
                    <span className="text-muted">Sector</span>
                    <span className="font-medium text-navy">{profile.sector}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notification banner */}
        {showNotifBanner && (
          <div className="card bg-teal-50 border-primary/30 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white text-sm">🔔</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-navy">Enable task reminders?</p>
                <p className="text-xs text-civic-600 mt-0.5">
                  Beginly can notify you when tasks are due — no spam, unsubscribe anytime.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={requestNotifications} className="btn-primary text-sm flex-1 justify-center">
                Enable reminders
              </button>
              <button onClick={() => finishWithNotifs("denied")} className="btn-ghost text-sm flex-1 justify-center">
                Not now
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 ? (
            <button onClick={back} className="btn-ghost flex-1 justify-center">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button onClick={() => router.push("/platform")} className="btn-ghost flex-1 justify-center">
              Skip for now
            </button>
          )}

          {!isLastStep ? (
            <button
              onClick={next}
              disabled={!canProceed()}
              className="btn-primary flex-1 justify-center disabled:opacity-40"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="btn-primary flex-1 justify-center disabled:opacity-50"
            >
              {loading ? "Building roadmap..." : <><CheckCircle className="w-4 h-4" /> Build my roadmap</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
