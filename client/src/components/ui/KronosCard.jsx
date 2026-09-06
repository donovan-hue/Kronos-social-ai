export default function KronosCard({
  children,
  variant = "silver",
  className = "",
  title = "",
  subtitle = "",
  actions = null,
  padding = "md",
  as: Component = "section",
}) {
  const themeClass =
    variant === "copper"
      ? "kronos-theme-copper"
      : variant === "pink"
        ? "kronos-theme-pink"
        : "kronos-theme-silver";

  const paddingClass =
    padding === "none"
      ? "kronos-card--padding-none"
      : padding === "sm"
        ? "kronos-card--padding-sm"
        : padding === "lg"
          ? "kronos-card--padding-lg"
          : "kronos-card--padding-md";

  const classes = [
    "kronos-card",
    themeClass,
    paddingClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes}>
      {(title || subtitle || actions) && (
        <header className="kronos-card-header">
          <div className="kronos-card-heading">
            {title && (
              <h2 className="kronos-card-title">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="kronos-card-subtitle">
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div className="kronos-card-actions">
              {actions}
            </div>
          )}
        </header>
      )}

      <div className="kronos-card-body">
        {children}
      </div>
    </Component>
  );
}
