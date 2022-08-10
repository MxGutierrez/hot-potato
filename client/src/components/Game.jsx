import { useEffect, useState } from "react";
import Button from "./Button";
import enGB from "date-fns/locale/en-GB";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MAX_FUTURE_EXPIRATION_TIME_DAYS } from "../constants";

function Game({ id, address, hotPotatoGameContract, hotPotatoContract }) {
  const [startingGame, setStartingGame] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [expirationDate, setExpirationDate] = useState(null);
  const [hotPotatoCount, setHotPotatoCount] = useState(2);
  const [players, setPlayers] = useState([address]);

  useEffect(() => {
    registerLocale("en-GB", enGB);
  });

  const startGame = async () => {
    setStartingGame(true);
    try {
      const receipt = await hotPotatoGameContract.methods
        .startGame(id, hotPotatoCount, expirationDate.getTime() / 1000)
        .send({ from: address });
      console.log(receipt);
    } catch (ex) {
      console.log("error", ex);
      window.test = ex;
    } finally {
      setStartingGame(false);
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    const subscriptions = [
      hotPotatoGameContract.events.PlayerJoined(
        {
          filter: { gameId: id },
        },
        (err, res) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log("player joined", res);
          setPlayers((players) => [...players, res.returnValues.player]);
        }
      ),

      hotPotatoGameContract.events.GameStarted(
        {
          filter: { gameId: id },
        },
        (err, res) => {
          if (err) {
            console.log(err);
            return;
          }
          setGameStarted(true);
        }
      ),
    ];

    return () => {
      subscriptions.forEach((sub) => console.log(sub.unsubscribe()));
    };
  }, [id]);

  return (
    <div>
      <h1>Game: {id}</h1>
      <label>
        Hot potatos:
        <input
          type="number"
          value={hotPotatoCount}
          onChange={(e) => setHotPotatoCount(e.target.value)}
        />
      </label>

      <label>
        Game expiration:
        <DatePicker
          selected={expirationDate}
          onChange={setExpirationDate}
          locale="en-GB"
          placeholderText="Select date"
          minDate={new Date()}
          maxDate={
            new Date(
              Date.now() + 1000 * 60 * 60 * 24 * MAX_FUTURE_EXPIRATION_TIME_DAYS
            )
          }
        />
      </label>
      <Button onClick={startGame} loading={startingGame}>
        Start game
      </Button>

      <h2>Players</h2>
      {players.map((address) => (
        <p key={address}>{address}</p>
      ))}
      {gameStarted && <p>Game started!!!!!!!!</p>}
    </div>
  );
}

export default Game;