import ExclamationCircle from "./icons/ExclamationCircle";

function FormError({ children }) {
  return (
    <p className="flex items-center text-xs text-red-700 mt-1">
      <ExclamationCircle className="w-4 h-4 mr-1.5" />
      {children}
    </p>
  );
}

export default FormError;
