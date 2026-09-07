import PropTypes from "prop-types";

export default function Card({ children, as: Component = "section", variant = "surface", className = "", ...props }) {
  return <Component className={`k-card k-card-${variant} ${className}`} {...props}>{children}</Component>;
}

Card.propTypes = { children: PropTypes.node, as: PropTypes.elementType, variant: PropTypes.oneOf(["surface", "metal", "ai"]), className: PropTypes.string };
