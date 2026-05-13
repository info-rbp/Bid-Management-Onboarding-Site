import { ValidationError, ValidationResult } from '@/lib/onboardingValidation';

type Props = {
  validationResult: ValidationResult;
  onJumpTo?: (error: ValidationError) => void;
};

export function ValidationSummary({ validationResult, onJumpTo }: Props) {
  if (validationResult.isValid) return null;

  const scrollTo = (anchorId?: string) => {
    if (!anchorId) return;
    const el = document.getElementById(anchorId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if ('focus' in el) (el as HTMLElement).focus();
  };

  return (
    <div data-validation-summary="true" className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <h3 className="font-bold text-destructive mb-2">Please complete the following before continuing</h3>
      {validationResult.missingFields.length > 0 && <div className="mb-2"><p className="font-semibold">Missing information:</p><ul className="list-disc ml-6">{validationResult.missingFields.map((e) => <li key={e.fieldKey}><button className="underline text-left" onClick={() => (onJumpTo ? onJumpTo(e) : scrollTo(e.anchorId))}>{e.fieldLabel}</button></li>)}</ul></div>}
      {validationResult.invalidFields.length > 0 && <div><p className="font-semibold">Invalid information:</p><ul className="list-disc ml-6">{validationResult.invalidFields.map((e) => <li key={e.fieldKey}><button className="underline text-left" onClick={() => (onJumpTo ? onJumpTo(e) : scrollTo(e.anchorId))}>{e.message}</button></li>)}</ul></div>}
    </div>
  );
}
