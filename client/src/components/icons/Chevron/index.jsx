import Down from "./Down";
import Up from "./Up";

const componentMapping = {
  down: Down,
  up: Up,
};

function Chevron({ dir = "down", className }) {
  const ProxiedComponent = componentMapping[dir];

  return <ProxiedComponent className={className} />;
}

export default Chevron;
