import { 
  Zap, 
  Building2, 
  AlertCircle, 
  FileText, 
  Award, 
  ShoppingCart, 
  Users, 
  CheckCircle2, 
  Target, 
  DollarSign, 
  Globe, 
  ShieldCheck, 
  FileBadge, 
  Gift, 
  BarChart3, 
  Send, 
  MessageSquare, 
  Clock, 
  Library, 
  Scale, 
  Flag 
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface OnboardingStep {
  key: string;
  title: string;
  shortTitle: string;
  route: string;
  icon: LucideIcon;
  required: boolean;
  conditional: boolean;
  isEnabled?: (selectedServices: string[]) => boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { key: "welcome_expectations", title: "Welcome & Expectations", shortTitle: "Welcome & Expectations", route: "/onboarding/welcome_expectations", icon: Zap, required: true, conditional: false },
  { key: "business_snapshot", title: "Business Snapshot", shortTitle: "Business Snapshot", route: "/onboarding/business_snapshot", icon: Building2, required: true, conditional: false },
  { key: "opportunity_triage", title: "Opportunity Triage", shortTitle: "Opportunity Triage", route: "/onboarding/opportunity_triage", icon: AlertCircle, required: true, conditional: false },
  { key: "service_selection", title: "Service Selection", shortTitle: "Service Selection", route: "/onboarding/service_selection", icon: FileText, required: true, conditional: false },
  { key: "business_profile", title: "Business Profile", shortTitle: "Business Profile", route: "/onboarding/business_profile", icon: Award, required: true, conditional: false },
  { key: "offer_menu", title: "Offer Menu", shortTitle: "Offer Menu", route: "/onboarding/offer_menu", icon: ShoppingCart, required: true, conditional: false },
  { key: "team_capacity", title: "Team & Capacity", shortTitle: "Team & Capacity", route: "/onboarding/team_capacity", icon: Users, required: true, conditional: false },
  { key: "proof_evidence", title: "Proof & Evidence", shortTitle: "Proof & Evidence", route: "/onboarding/proof_evidence", icon: CheckCircle2, required: true, conditional: false },
  { key: "goals_strategy", title: "Goals & Strategy", shortTitle: "Goals & Strategy", route: "/onboarding/goals_strategy", icon: Target, required: true, conditional: false },
  { key: "pricing_commercial", title: "Pricing & Commercial", shortTitle: "Pricing & Commercial", route: "/onboarding/pricing_commercial", icon: DollarSign, required: true, conditional: false },
  { key: "platform_setup", title: "Platform Setup", shortTitle: "Platform Setup", route: "/onboarding/platform_setup", icon: Globe, required: true, conditional: false },
  { key: "compliance_insurance", title: "Compliance & Insurance", shortTitle: "Compliance & Insurance", route: "/onboarding/compliance_insurance", icon: ShieldCheck, required: true, conditional: false },
  {
    key: "tender_readiness",
    title: "Tender Readiness",
    shortTitle: "Tender Readiness",
    route: "/onboarding/tender_readiness",
    icon: FileBadge,
    required: false,
    conditional: true,
    isEnabled: (services) =>
      services.includes("Government Tenders") ||
      services.includes("Private Tenders") ||
      services.includes("Panel or Supplier Registrations") ||
      services.includes("Unsure, please recommend")
  },
  {
    key: "grants",
    title: "Grants",
    shortTitle: "Grants",
    route: "/onboarding/grants",
    icon: Gift,
    required: false,
    conditional: true,
    isEnabled: (services) =>
      services.includes("Grants") ||
      services.includes("Unsure, please recommend")
  },
  {
    key: "marketplace_strategy",
    title: "Marketplace Strategy",
    shortTitle: "Marketplace Strategy",
    route: "/onboarding/marketplace_strategy",
    icon: BarChart3,
    required: false,
    conditional: true,
    isEnabled: (services) =>
      services.includes("Marketplace Leads") ||
      services.includes("Unsure, please recommend")
  },
  {
    key: "direct_outreach_strategy",
    title: "Outreach Strategy",
    shortTitle: "Outreach Strategy",
    route: "/onboarding/direct_outreach_strategy",
    icon: Send,
    required: false,
    conditional: true,
    isEnabled: (services) =>
      services.includes("Direct Proposals") ||
      services.includes("Unsure, please recommend")
  },
  {
    key: "quote_support",
    title: "Quote Support",
    shortTitle: "Quote Support",
    route: "/onboarding/quote_support",
    icon: MessageSquare,
    required: false,
    conditional: true,
    isEnabled: (services) =>
      services.includes("Quote Requests") ||
      services.includes("Marketplace Leads") ||
      services.includes("Direct Proposals") ||
      services.includes("Unsure, please recommend")
  },
  { key: "workflow_rules", title: "Workflow Rules", shortTitle: "Workflow Rules", route: "/onboarding/workflow_rules", icon: Clock, required: true, conditional: false },
  { key: "document_upload_library", title: "Document Upload Library", shortTitle: "Document Upload Library", route: "/onboarding/document_upload_library", icon: Library, required: true, conditional: false },
  { key: "authority_matrix", title: "Authority Matrix", shortTitle: "Authority Matrix", route: "/onboarding/authority_matrix", icon: Scale, required: true, conditional: false },
  { key: "final_submission", title: "Final Submission", shortTitle: "Final Submission", route: "/onboarding/final_submission", icon: Flag, required: true, conditional: false }
];

export function getVisibleOnboardingSteps(selectedServices: string[]): OnboardingStep[] {
  return ONBOARDING_STEPS.filter(step => {
    if (!step.conditional) return true;
    return step.isEnabled?.(selectedServices) ?? false;
  });
}
