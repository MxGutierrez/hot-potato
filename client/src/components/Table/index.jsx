import { Stage, Sprite } from "@inlet/react-pixi/animated";
import { Spring } from "react-spring";
import { useState } from "react";

import { useEffect } from "react";
import Player from "./Player";

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 700;

function Table({ id, started, ended, address, players, contract }) {
  const [points, setPoints] = useState([]);
  const [hotPotatoer, setHotPotatoer] = useState(null);
  const [hotPotatoCoords, setHotPotatoCoords] = useState(null);

  useEffect(() => {
    const [r, cx, cy] = [200, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2];

    const points = players.map((address, i) => {
      const x = cx + r * Math.cos((2 * Math.PI * i) / players.length);
      const y = cy + r * Math.sin((2 * Math.PI * i) / players.length);
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

    setHotPotatoCoords({ x: x - 30, y: y + 30 });
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
          gameEnded={ended}
          x={x}
          y={y}
          transferHotPotato={transferHotPotato}
        />
      ))}
      {hotPotatoCoords && (
        <Spring native to={hotPotatoCoords}>
          {(coords) => (
            <Sprite
              scale={{ x: 0.6, y: 0.6 }}
              anchor={0.5}
              image="/hot-potato.png"
              {...coords}
            />
          )}
        </Spring>
      )}
    </Stage>
  );
}

export default Table;
