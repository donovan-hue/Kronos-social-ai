import PropTypes from "prop-types";
import { useCallback, useState } from "react";

export default function KronosButton({
  children,
  type = "button",
  variant = "silver",
  size = "md",
  icon = null,
  className = "",
  disabled = false,
  loading = false,
  onClick,
  ariaLabel,
}) {
  const [isBouncing, setIsBouncing] = useState(false);

  const themeClass =
    variant === "copper"
      ? "kronos-theme-copper"
      : variant === "pink"
        ? "kronos-theme-pink"
        : "kronos-theme-silver";

  const sizeClass =
    size === "sm"
      ? "kronos-bubble-sm"
      : size === "lg"
        ? "kronos-bubble-lg"
        : "kronos-bubble-md";

  const classes = [
    "kronos-bubble",
    themeClass,
    sizeClass,
    isBouncing ? "kronos-bubble-bounce" : "",
    loading ? "kronos-bubble-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = useCallback(
    (event) => {
      if (disabled || loading) {
        return;
      }

      setIsBouncing(false);

      requestAnimationFrame(() => {
        setIsBouncing(true);
      });

      if (typeof onClick === "function") {
        onClick(event);
      }
    },
    [disabled, loading, onClick],
  );

  const handleAnimationEnd = useCallback(() => {
    setIsBouncing(false);
  }, []);

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      <span className="kronos-bubble-highlight" aria-hidden="true" />

      {loading ? (
        <span
          className="kronos-button-spinner"
          aria-hidden="true"
        />
      ) : (
        icon && (
          <span
            className="kronos-button-icon"
            aria-hidden="true"
          >
            {icon}
          </span>
        )
      )}

      <span className="kronos-button-label">
        {loading ? "Procesando..." : children}
      </span>
    </button>
  );
}

KronosButton.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf(["silver", "copper", "pink"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  icon: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  ariaLabel: PropTypes.string,
};
