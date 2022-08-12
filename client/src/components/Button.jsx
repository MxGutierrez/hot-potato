import Spinner from "./Spinner";
import clsx from "clsx";

const typeClassMap = {
  primary: "bg-primary text-white",
  outlined: "border border-primary bg-white text-primary",
};

function Button({
  onClick,
  loading,
  disabled,
  unselectable,
  type = "primary",
  children,
  className,
}) {
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
        "rounded-lg py-3 px-4 flex items-center justify-center h-[44px] font-semibold",
        typeClassMap[type],
        { "opacity-90 cursor-not-allowed": disabled },
        { "bg-gray-300 cursor-default pointer-events-none": unselectable },
        className
      )}
    >
      {loading ? <Spinner className="h-5 w-5 text-white" /> : children}
    </button>
  );
}

export default Button;
