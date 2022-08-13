import { Stage, Graphics, Sprite, Container } from "@inlet/react-pixi";
import { useState, useCallback } from "react";
import { jsNumberForAddress } from "react-jazzicon";
import jazzicon from "jazzicon";

import { useEffect } from "react";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;

function Table({ players }) {
  const [points, setPoints] = useState([]);

  const drawJazzicon = useCallback((g, { x, y }) => {
    g.clear();
    g.lineStyle(22, 0xf9fafb);
    g.drawCircle(x, y, 60);
    g.endFill();
  }, []);

  const drawTable = useCallback((g) => {
    g.clear();
    g.beginFill(0x6366f1, 0.25);
    g.drawEllipse(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 100, 60);
    g.endFill();
  }, []);

  const generateJazzicon = (address) => {
    const jazziconEl = jazzicon(100, jsNumberForAddress(address)).children[0];
    jazziconEl.firstChild.remove();
    const xml = new XMLSerializer().serializeToString(jazziconEl);
    const svg64 = window.btoa(xml);
    return "data:image/svg+xml;base64," + svg64;
  };

  useEffect(() => {
    // https://stackoverflow.com/questions/58534293/how-can-i-distribute-points-evenly-along-an-oval
    const [a, b, cx, cy] = [180, 140, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2];

    const points = players.map((address, i) => {
      let t = (2 * Math.PI * i) / players.length;
      t =
        t +
        0.4 *
          Math.atan(
            ((a - b) * Math.tan(t)) / (a + b * Math.tan(t) * Math.tan(t))
          );
      const sq = 1 / Math.hypot(a * Math.sin(t), b * Math.cos(t));
      const x = Math.round(cx + (a - b * sq) * Math.cos(t));
      const y = Math.round(cy + (b - a * sq) * Math.sin(t));
      return { address, x, y };
    });

    setPoints(points);
  }, [players]);

  return (
    <Stage
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      raf={false}
      renderOnComponentChange={true}
      options={{ antialias: true, backgroundAlpha: 0 }}
    >
      {points.map(({ address, x, y }) => (
        <Container key={`${x}:${y}`}>
          <Sprite x={x} y={y} anchor={0.5} image={generateJazzicon(address)} />
          <Graphics draw={(g) => drawJazzicon(g, { x, y })} />
        </Container>
      ))}
      <Graphics draw={drawTable} />
    </Stage>
  );
}

export default Table;
