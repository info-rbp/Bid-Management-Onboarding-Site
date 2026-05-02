
import {
  Activity,
  Anchor,
  Award,
  BookUser,
  Building2,
  Check,
  ClipboardList,
  FileText,
  Flag,
  GanttChartSquare,
  Globe,
  Goal,
  HeartHandshake,
  Info,
  Lightbulb,
  MessageCircleQuestion,
  Paperclip,
  PocketKnife,
  Presentation,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Siren,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

export interface OnboardingStep {
  key: string;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  description: string;
  required: boolean;
  isConditional?: boolean;
  moduleKey?: keyof EnabledModules;
  route: string;
}

export interface EnabledModules {
  tenderReadiness: boolean;
  grants: boolean;
  marketplaceStrategy: boolean;
  directOutreachStrategy: boolean;
  quoteSupport: boolean;
}

export const allSteps: OnboardingStep[] = [
  // Phase 1: Core Setup
  {
    key: "welcome_expectations",
    title: "Welcome & Expectations",
    shortTitle: "Welcome",
    icon: HeartHandshake,
    description: "Understand the onboarding process and what to expect.",
    required: true,
    route: "/onboarding/welcome_expectations",
  },
  {
    key: "business_snapshot",
    title: "Business Snapshot",
    shortTitle: "Snapshot",
    icon: Building2,
    description: "Core details about your organization's scale and structure.",
    required: true,
    route: "/onboarding/business_snapshot",
  },
  {
    key: "opportunity_triage",
    title: "Opportunity Triage",
    shortTitle: "Triage Rules",
    icon: Search,
    description: "Define which opportunities are a 'YES' and which are a 'NO'.",
    required: true,
    route: "/onboarding/opportunity_triage",
  },
  {
    key: "service_selection",
    title: "Service Selection",
    shortTitle: "Services",
    icon: Sparkles,
    description: "Select the services you want Bid Manager to support you with.",
    required: true,
    route: "/onboarding/service_selection",
  },
  // Phase 2: Strategic Foundation
  {
    key: "business_profile",
    title: "Business Profile",
    shortTitle: "Profile",
    icon: BookUser,
    description: "Tell us the story of your business for compelling narratives.",
    required: true,
    route: "/onboarding/business_profile",
  },
  {
    key: "offer_menu",
    title: "Offer Menu",
    shortTitle: "Offers",
    icon: GanttChartSquare,
    description: "List your key products and services.",
    required: true,
    route: "/onboarding/offer_menu",
  },
  {
    key: "team_capacity",
    title: "Team & Capacity",
    shortTitle: "Team",
    icon: Users,
    description: "Help us understand who is delivering the work.",
    required: true,
    route: "/onboarding/team_capacity",
  },
  {
    key: "proof_evidence",
    title: "Proof & Evidence",
    shortTitle: "Proof",
    icon: Award,
    description: "Tenders are won on proof. List your strongest examples.",
    required: true,
    route: "/onboarding/proof_evidence",
  },
  {
    key: "goals_strategy",
    title: "Goals & Strategy",
    shortTitle: "Goals",
    icon: Goal,
    description: "Where are we heading?",
    required: true,
    route: "/onboarding/goals_strategy",
  },
  {
    key: "pricing_commercial",
    title: "Pricing & Commercial",
    shortTitle: "Pricing",
    icon: Scale,
    description: "Standardise your pricing approach.",
    required: true,
    route: "/onboarding/pricing_commercial",
  },
  {
    key: "platform_setup",
    title: "Platform & Channel Setup",
    shortTitle: "Platforms",
    icon: Globe,
    description: "Tell us which platforms you already use.",
    required: true,
    route: "/onboarding/platform_setup",
  },
  {
    key: "compliance_insurance",
    title: "Compliance & Readiness",
    shortTitle: "Compliance",
    icon: ShieldCheck,
    description: "A readiness check for critical compliance documents.",
    required: true,
    route: "/onboarding/compliance_insurance",
  },
  // Phase 3: Conditional Service Modules
  {
    key: "tender_readiness",
    title: "Tender Readiness",
    shortTitle: "Tenders",
    icon: FileText,
    description: "Prepare for formal procurement opportunities.",
    required: true,
    isConditional: true,
    moduleKey: "tenderReadiness",
    route: "/onboarding/tender_readiness",
  },
  {
    key: "grants",
    title: "Grants",
    shortTitle: "Grants",
    icon: Lightbulb,
    description: "Identify projects that need funding.",
    required: false,
    isConditional: true,
    moduleKey: "grants",
    route: "/onboarding/grants",
  },
  {
    key: "marketplace_strategy",
    title: "Marketplace Lead Strategy",
    shortTitle: "Marketplaces",
    icon: PocketKnife,
    description: "Strategy for marketplace lead platforms.",
    required: false,
    isConditional: true,
    moduleKey: "marketplaceStrategy",
    route: "/onboarding/marketplace_strategy",
  },
  {
    key: "direct_outreach_strategy",
    title: "Direct Outreach Strategy",
    shortTitle: "Outreach",
    icon: Anchor,
    description: "Strategy for direct proposals and campaigns.",
    required: false,
    isConditional: true,
    moduleKey: "directOutreachStrategy",
    route: "/onboarding/direct_outreach_strategy",
  },
  {
    key: "quote_support",
    title: "Quote Request Support",
    shortTitle: "Quotes",
    icon: MessageCircleQuestion,
    description: "How we can help prepare and review quotes.",
    required: false,
    isConditional: true,
    moduleKey: "quoteSupport",
    route: "/onboarding/quote_support",
  },
  // Phase 4: Finalisation
  {
    key: "workflow_rules",
    title: "Communication & Workflow",
    shortTitle: "Workflow",
    icon: Workflow,
    description: "Set your preferences for communication and approvals.",
    required: true,
    route: "/onboarding/workflow_rules",
  },
  {
    key: "document_upload_library",
    title: "Document Upload Library",
    shortTitle: "Documents",
    icon: Paperclip,
    description: "Upload documents for your bid library.",
    required: true,
    route: "/onboarding/document_upload_library",
  },
  {
    key: "authority_matrix",
    title: "Authority Matrix",
    shortTitle: "Authority",
    icon: Flag,
    description: "Confirm what Bid Manager can do on your behalf.",
    required: true,
    route: "/onboarding/authority_matrix",
  },
  {
    key: "final_submission",
    title: "Final Declaration & Submission",
    shortTitle: "Submission",
    icon: Check,
    description: "Final review and submission of your onboarding pack.",
    required: true,
    route: "/onboarding/final_submission",
  },
];

export function getVisibleOnboardingSteps(
  enabledModules?: EnabledModules
): OnboardingStep[] {
  if (!enabledModules) {
    // Before service selection, show only the initial steps
    return allSteps.filter(step => !step.isConditional);
  }

  const visibleSteps: OnboardingStep[] = [];
  const conditionalModuleKeys: (keyof EnabledModules)[] = [
    "tenderReadiness",
    "grants",
    "marketplaceStrategy",
    "directOutreachStrategy",
    "quoteSupport",
  ];

  for (const step of allSteps) {
    if (step.isConditional) {
      // It's a conditional step, check if its module is enabled
      if (step.moduleKey && enabledModules[step.moduleKey]) {
        visibleSteps.push(step);
      }
    } else {
      // It's a core step, always include it
      visibleSteps.push(step);
    }
  }
  
  // Ensure the order is correct by re-inserting conditional modules in their designated place
  const finalSteps: OnboardingStep[] = [];
  const tenderReadinessIndex = allSteps.findIndex(s => s.key === 'tender_readiness');
  
  const coreStepsBeforeConditionals = allSteps.slice(0, tenderReadinessIndex).filter(s => !s.isConditional);
  const coreStepsAfterConditionals = allSteps.slice(tenderReadinessIndex).filter(s => !s.isConditional);

  finalSteps.push(...coreStepsBeforeConditionals);
  
  // Add enabled conditional modules in their predefined order
  for (const moduleKey of conditionalModuleKeys) {
    if (enabledModules[moduleKey]) {
      const stepToAdd = allSteps.find(s => s.moduleKey === moduleKey);
      if (stepToAdd) {
        finalSteps.push(stepToAdd);
      }
    }
  }
  
  finalSteps.push(...coreStepsAfterConditionals);

  // Return only the steps that are actually present in the original filtered `visibleSteps`
  const visibleKeys = new Set(visibleSteps.map(s => s.key));
  return finalSteps.filter(s => visibleKeys.has(s.key));
}
