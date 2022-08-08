import Spinner from "./Spinner";
import clsx from "clsx";

function Button({ onClick, loading, disabled, children }) {
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
        "bg-blue-600 mt-3 rounded-md p-[10px] text-white flex items-center justify-center h-[44px]",
        { "opacity-90 cursor-not-allowed": disabled }
      )}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

export default Button;
