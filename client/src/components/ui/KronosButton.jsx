import PropTypes from "prop-types";

export default function KronosButton({
  children,
  type = "button",
  variant = "silver",
  size = "md",
  icon = null,
  className = "",
  disabled = false,
  onClick,
  ariaLabel,
}) {
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
        : "";

  const classes = [
    "kronos-bubble",
    themeClass,
    sizeClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {icon && (
        <span
          className="kronos-button-icon"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      <span className="kronos-button-label">
        {children}
      </span>
    </button>
  );
}

KronosButton.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf([
    "button",
    "submit",
    "reset",
  ]),
  variant: PropTypes.oneOf([
    "silver",
    "copper",
    "pink",
  ]),
  size: PropTypes.oneOf([
    "sm",
    "md",
    "lg",
  ]),
  icon: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  ariaLabel: PropTypes.string,
};
