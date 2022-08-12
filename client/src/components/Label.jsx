import clsx from "clsx";

function Label({ className, children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className={clsx("text-xs mb-1 block", className)}>
      {children}
    </label>
  );
}

export default Label;
