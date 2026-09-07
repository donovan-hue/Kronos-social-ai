import PropTypes from "prop-types";

export default function IconButton({ label, children, className = "", ...props }) {
  return <button className={`k-icon-button ${className}`} type="button" aria-label={label} {...props}>{children}</button>;
}

IconButton.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node, className: PropTypes.string };
