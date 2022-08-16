import { Text } from "@inlet/react-pixi";
import { TextStyle } from "pixi.js";

function Address({ address, x, y }) {
  return (
    <Text
      text={`${address.substring(0, 5)}…${address.substring(
        address.length - 4
      )}`}
      anchor={0.5}
      x={x}
      y={y - 65}
      scale={0.7}
      style={
        new TextStyle({
          fontSize: 20,
          fill: 0x6366f1,
        })
      }
    />
  );
}

export default Address;
