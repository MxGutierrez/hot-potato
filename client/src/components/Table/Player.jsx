import { useState, useEffect, useCallback, useMemo } from "react";
import { jsNumberForAddress } from "react-jazzicon";
import { Graphics, Sprite, Container, Text } from "@inlet/react-pixi";
import { TextStyle } from "pixi.js";
import Address from "./Address";
import jazzicon from "jazzicon";

function Player({
  me,
  iHaveHotPotato,
  gameEnded,
  address,
  hasHotPotato,
  x,
  y,
  transferHotPotato,
}) {
  const [playerJazzicon, setPlayerJazzicon] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [transferingHotPotato, setTransferingHotPotato] = useState(null);

  const canTransfer = useMemo(
    () => me !== address && iHaveHotPotato && !hasHotPotato && !gameEnded,
    [me, iHaveHotPotato, hasHotPotato, gameEnded, address]
  );

  const drawJazzicon = useCallback((g, { x, y }) => {
    g.clear();
    g.lineStyle(22, 0xf9fafb);
    g.drawCircle(x, y, 60);
    g.endFill();
  }, []);

  const drawLabelEllipse = useCallback(
    (g) => {
      g.clear();
      g.beginFill(0xffffff);
      g.drawEllipse(x, y - 25, 15, 10);
      g.endFill();
    },
    [x, y]
  );

  useEffect(() => {
    const jazziconEl = jazzicon(100, jsNumberForAddress(address)).children[0];
    jazziconEl.firstChild.remove();
    const xml = new XMLSerializer().serializeToString(jazziconEl);
    const svg64 = window.btoa(xml);
    setPlayerJazzicon("data:image/svg+xml;base64," + svg64);
  }, [address]);

  const transfer = async () => {
    setTransferingHotPotato(true);
    await transferHotPotato(address);
    setTransferingHotPotato(false);
  };

  return (
    <Container
      interactive={true}
      buttonMode={true}
      pointerdown={canTransfer && transfer}
      cursor={canTransfer ? "pointer" : "default"}
      mouseover={() => setShowTooltip(true)}
      mouseout={() => setShowTooltip(false)}
    >
      {playerJazzicon && (
        <Sprite x={x} y={y} anchor={0.5} image={playerJazzicon} />
      )}
      <Graphics draw={(g) => drawJazzicon(g, { x, y })} />
      {me === address && (
        <>
          <Graphics draw={drawLabelEllipse} />
          <Text
            text="You"
            anchor={0.5}
            x={x}
            y={y - 25}
            scale={0.6}
            style={
              new TextStyle({
                fontSize: 20,
              })
            }
          />
        </>
      )}
      {showTooltip && me !== address && (
        <Address address={address} x={x} y={y} />
      )}
    </Container>
  );
}

export default Player;
