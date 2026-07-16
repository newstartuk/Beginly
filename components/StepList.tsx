"use client";

interface StepListProps {
  steps: string[];
  className?: string;
}

export default function StepList({ steps, className = "" }: StepListProps) {
  return (
    <ol className={`space-y-3${className ? ` ${className}` : ""}`}>
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 text-sm text-civic-700">
          <span className="shrink-0 w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}
