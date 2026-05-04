
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
  outreachStrategy: boolean;
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
    title: "Platform Setup",
    shortTitle: "Platforms",
    icon: Globe,
    description: "Tell us which platforms you already use.",
    required: true,
    route: "/onboarding/platform_setup",
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
    title: "Marketplace Strategy",
    shortTitle: "Marketplaces",
    icon: PocketKnife,
    description: "Strategy for marketplace lead platforms.",
    required: false,
    isConditional: true,
    moduleKey: "marketplaceStrategy",
    route: "/onboarding/marketplace_strategy",
  },
  {
    key: "outreach_strategy",
    title: "Outreach Strategy",
    shortTitle: "Outreach",
    icon: Anchor,
    description: "Strategy for direct proposals and campaigns.",
    required: false,
    isConditional: true,
    moduleKey: "outreachStrategy",
    route: "/onboarding/outreach_strategy",
  },
  {
    key: "quote_support",
    title: "Quote Support",
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
    key: "opportunity_triage",
    title: "Opportunity Triage",
    shortTitle: "Triage Rules",
    icon: Search,
    description: "Define which opportunities are a 'YES' and which are a 'NO'.",
    required: true,
    route: "/onboarding/opportunity_triage",
  },
    {
    key: "compliance_insurance",
    title: "Compliance",
    shortTitle: "Compliance",
    icon: ShieldCheck,
    description: "A readiness check for critical compliance documents.",
    required: true,
    route: "/onboarding/compliance_insurance",
  },
  {
    key: "workflow_rules",
    title: "Workflow & Communication",
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
    title: "Final Submission",
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
    return allSteps.filter(step => !step.isConditional);
  }

  return allSteps.filter(step => {
    if (!step.isConditional) {
      return true; 
    }
    return step.moduleKey && enabledModules[step.moduleKey];
  });
}
