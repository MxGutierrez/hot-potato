import Spinner from "./Spinner";
import clsx from "clsx";

function Button({ onClick, loading, disabled, children, className }) {
  const handleClick = () => {
    if (disabled || loading) {
      return;
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "bg-primary mt-3 rounded-lg py-3 px-4 text-white flex items-center justify-center h-[44px] font-semibold",
        { "opacity-90 cursor-not-allowed": disabled },
        className
      )}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

export default Button;
