import { useState, useEffect, useCallback } from "react";
import { jsNumberForAddress } from "react-jazzicon";
import { Graphics, Sprite, Container } from "@inlet/react-pixi";
import jazzicon from "jazzicon";

function Player({
  me,
  iHaveHotPotato,
  address,
  hasHotPotato,
  x,
  y,
  transferHotPotato,
}) {
  const [playerJazzicon, setPlayerJazzicon] = useState(null);
  const [transferingHotPotato, setTransferingHotPotato] = useState(null);

  const drawJazzicon = useCallback((g, { x, y }) => {
    g.clear();
    g.lineStyle(22, 0xf9fafb);
    g.drawCircle(x, y, 60);
    g.endFill();
  }, []);

  useEffect(() => {
    const jazziconEl = jazzicon(100, jsNumberForAddress(address)).children[0];
    jazziconEl.firstChild.remove();
    const xml = new XMLSerializer().serializeToString(jazziconEl);
    const svg64 = window.btoa(xml);
    setPlayerJazzicon("data:image/svg+xml;base64," + svg64);
  }, []);

  const transfer = async () => {
    setTransferingHotPotato(true);
    await transferHotPotato(address);
    setTransferingHotPotato(false);
  };

  return (
    <Container
      interactive={me !== address && iHaveHotPotato && !hasHotPotato}
      pointerdown={transfer}
    >
      {playerJazzicon && (
        <Sprite x={x} y={y} anchor={0.5} image={playerJazzicon} />
      )}
      <Graphics draw={(g) => drawJazzicon(g, { x, y })} />
    </Container>
  );
}

export default Player;
