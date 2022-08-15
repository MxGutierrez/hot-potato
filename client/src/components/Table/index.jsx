import { Stage, Sprite } from "@inlet/react-pixi/animated";
import { Spring } from "react-spring";
import { useState } from "react";

import { useEffect } from "react";
import Player from "./Player";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;

function Table({ id, started, address, players, contract }) {
  const [points, setPoints] = useState([]);
  const [hotPotatoer, setHotPotatoer] = useState(null);
  const [hotPotatoCoords, setHotPotatoCoords] = useState(null);

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
    if (!started) {
      return;
    }

    const getPlayersWithHotpotatoes = async () => {
      const hotPotatoer = await contract.methods.ownerOf(id).call();

      setHotPotatoer(hotPotatoer);
    };

    getPlayersWithHotpotatoes();
  }, [id, started, contract]);

  useEffect(() => {
    if (!hotPotatoer) {
      return;
    }

    const { x, y } = points.find(({ address }) => address === hotPotatoer);

    setHotPotatoCoords({ x, y });
  }, [hotPotatoer, points]);

  const transferHotPotato = async (pAddress) => {
    try {
      await contract.methods
        .safeTransferFrom(address, pAddress, id)
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
        filter: { tokenId: id },
      },
      (err, res) => {
        if (err) {
          console.log(err);
          return;
        }

        setHotPotatoer(res.returnValues.to);
      }
    );

    return () => {
      transferSubscription.unsubscribe();
    };
  }, [id, started, contract]);

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
          iHaveHotPotato={hotPotatoer === address}
          hasHotPotato={hotPotatoer === pAddress}
          x={x}
          y={y}
          transferHotPotato={transferHotPotato}
        />
      ))}
      {hotPotatoCoords && (
        <Spring native to={hotPotatoCoords}>
          {(coords) => (
            <Sprite
              scale={{ x: 0.3, y: 0.3 }}
              anchor={0.5}
              image="/potato.svg"
              {...coords}
            />
          )}
        </Spring>
      )}
    </Stage>
  );
}

export default Table;
