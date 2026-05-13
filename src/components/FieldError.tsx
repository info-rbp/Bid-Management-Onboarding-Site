type FieldErrorProps = {
  message?: string;
  id?: string;
};

export function FieldError({ message, id }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p id={id} className="text-xs font-semibold text-destructive mt-1" role="alert">
      {message}
    </p>
  );
}

export function getFieldError(
  fieldErrors: Record<string, string> | undefined,
  fieldKey: string
) {
  return fieldErrors?.[fieldKey];
}

export function getFieldErrorId(fieldKey: string) {
  return `${fieldKey}-error`;
}

export function isFieldInvalid(
  fieldErrors: Record<string, string> | undefined,
  fieldKey: string
) {
  return Boolean(getFieldError(fieldErrors, fieldKey));
}
