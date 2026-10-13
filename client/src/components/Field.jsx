// Small reusable labelled input. forwardRef lets a parent focus it via useRef.
import { forwardRef } from 'react';

const Field = forwardRef(function Field({ label, children, ...props }, ref) {
  return (
    <label className="field">
      <span>{label}</span>
      {children ?? <input ref={ref} {...props} />}
    </label>
  );
});

export default Field;
