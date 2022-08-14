import { Stage, Sprite } from "@inlet/react-pixi/animated";
import { Spring } from "react-spring";
import { useState } from "react";

import { useEffect } from "react";
import Player from "./Player";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;

function Table({ id, started, address, players, hotPotatoBalances, contract }) {
  const [points, setPoints] = useState([]);
  const [iHaveHotPotato, setIHaveHotPotato] = useState(false);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [hotPotatoCoords, setHotPotatoCoords] = useState([]);

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

  useEffect(() => {
    const index = players.indexOf(address);

    setIHaveHotPotato(
      index !== -1 &&
        hotPotatoBalances[index] !== undefined &&
        parseInt(hotPotatoBalances[index]) > 0
    );
  }, [address, players, hotPotatoBalances]);

  const transferHotPotato = async (pAddress) => {
    try {
      await contract.methods
        .safeTransferFrom(address, pAddress, id, 1, 0x00)
        .send({ from: address });
    } catch (ex) {
      console.log(ex);
    }
  };

  useEffect(() => {
    if (!started) {
      return;
    }

    const transferSubscription = contract.events.Transfer(
      {
        filter: { _id: id },
      },
      (err, res) => {
        if (err) {
          console.log(err);
          return;
        }

        const from = res.returnValues._from;
        const to = res.returnValues._to;
        const toPoint = points.find(({ address }) => address === to);

        setHotPotatoCoords((coords) => {
          const index = coords.findIndex(({ address }) => address === from);
          return [
            ...coords.slice(0, index),
            { ...toPoint },
            ...coords.slice(index + 1),
          ];
        });
        console.log("transfer ", res);
      }
    );

    return () => {
      transferSubscription.unsubscribe();
    };
  }, [started]);

  useEffect(() => {
    const hotPotatoCoords = [];

    hotPotatoBalances.forEach((val, i) => {
      if (parseInt(val) > 0) {
        hotPotatoCoords.push({ ...points[i] });
      }
    });

    setHotPotatoCoords(hotPotatoCoords);
  }, [players, hotPotatoBalances]);

  return (
    <Stage
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      renderOnComponentChange={true}
      options={{ antialias: true, backgroundAlpha: 0 }}
    >
      {points.map(({ address: pAddress, x, y }, i) => (
        <Player
          key={pAddress}
          me={address}
          address={pAddress}
          iHaveHotPotato={iHaveHotPotato}
          hasHotPotato={
            hotPotatoBalances[i] !== undefined &&
            parseInt(hotPotatoBalances[i]) > 0
          }
          x={x}
          y={y}
          transferHotPotato={transferHotPotato}
        />
      ))}
      {hotPotatoCoords.map(({ x, y }) => (
        <Spring native to={{ x, y }} key={address}>
          {(coords) => (
            <Sprite
              scale={{ x: 0.3, y: 0.3 }}
              anchor={0.5}
              image="/potato.svg"
              {...coords}
            />
          )}
        </Spring>
      ))}
    </Stage>
  );
}

export default Table;
