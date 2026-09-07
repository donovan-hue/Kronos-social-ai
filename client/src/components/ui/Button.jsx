import PropTypes from "prop-types";

export default function Button({ children, variant = "secondary", loading = false, disabled = false, className = "", ...props }) {
  return <button className={`k-button k-button-${variant} ${className}`} disabled={disabled || loading} aria-busy={loading} {...props}>{loading ? "Procesando..." : children}</button>;
}

Button.propTypes = { children: PropTypes.node, variant: PropTypes.oneOf(["primary", "secondary", "ghost", "danger", "ai"]), loading: PropTypes.bool, disabled: PropTypes.bool, className: PropTypes.string };
