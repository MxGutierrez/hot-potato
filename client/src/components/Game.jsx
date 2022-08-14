import { useEffect, useState } from "react";
import clsx from "clsx";
import Button from "./Button";
import Table from "./Table";
import Label from "./Label";
import { Clipboard } from "./icons";

function Game({ id, address, hotPotatoGameContract, hotPotatoContract }) {
  const [startingGame, setStartingGame] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [hotPotatoCount, setHotPotatoCount] = useState(2);
  const [gameInfo, setGameInfo] = useState(null);
  const [gameIdCopied, setGameIdCopied] = useState(false);
  const [hotPotatoBalances, setHotPotatoBalances] = useState([]);
  const [fetchingGameInfo, setFetchingGameInfo] = useState(false);

  const startGame = async () => {
    setStartingGame(true);
    try {
      await hotPotatoGameContract.methods
        .startGame(id, hotPotatoCount)
        .send({ from: address });
    } catch (ex) {
      console.log("error", ex);
    } finally {
      setStartingGame(false);
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    const getGameInfo = async () => {
      setFetchingGameInfo(true);
      try {
        const [players, gameInfo] = await Promise.all([
          hotPotatoGameContract.methods.getPlayers(id).call(),
          hotPotatoGameContract.methods._games(id).call(),
        ]);

        setGameInfo({
          createdAt: gameInfo.createdAt,
          owner: gameInfo.owner,
          expiresAt: gameInfo.expiresAt,
          players,
        });
      } catch (ex) {
        console.log(ex);
      } finally {
        setFetchingGameInfo(false);
      }
    };

    getGameInfo();
  }, [id]);

  useEffect(() => {
    if (!gameInfo) {
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

          const newPlayer = res.returnValues.player;
          setGameInfo((gameInfo) => ({
            ...gameInfo,
            players: [...gameInfo.players, newPlayer],
          }));
        }
      ),

      hotPotatoGameContract.events.GameStarted(
        {
          filter: { gameId: id },
        },
        (err, _) => {
          if (err) {
            console.log(err);
            return;
          }
          setGameStarted(true);
        }
      ),
    ];

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [gameInfo]);

  useEffect(() => {
    if (!gameStarted) {
      return;
    }

    const getPlayersWithHotpotatoes = async () => {
      const balances = await hotPotatoContract.methods
        .balanceOfBatch(
          gameInfo.players,
          Array(gameInfo.players.length).fill(id)
        )
        .call();

      setHotPotatoBalances(balances);
    };

    getPlayersWithHotpotatoes();
  }, [gameStarted]);

  return (
    <div className="flex flex-col space-y-3">
      <div>
        <Label>Game ID</Label>
        <div className="text-primary">
          {gameIdCopied ? (
            <p>Copied!</p>
          ) : (
            <button
              onClick={() => {
                navigator.clipboard.writeText(id);
                setGameIdCopied(true);

                setTimeout(() => {
                  setGameIdCopied(false);
                }, 1000);
              }}
              className="hover:opacity-75 flex items-center space-x-2"
            >
              <Clipboard className="w-5 h-5 hover:opacity-100" />
              <span className="text-3xl font-light">{id}</span>
            </button>
          )}
        </div>
      </div>

      {!gameStarted && gameInfo?.owner === address && (
        <>
          <div>
            <Label htmlFor="game-create-hot-potatoes">Hot potatoes</Label>

            <input
              id="game-create-hot-potatoes"
              type="number"
              value={hotPotatoCount}
              onChange={(e) => setHotPotatoCount(e.target.value)}
              className="py-0.5 flex-1"
              autoComplete="off"
              placeholder="12345678"
            />
          </div>

          <Button onClick={startGame} loading={startingGame}>
            Start game
          </Button>
        </>
      )}
      {!gameStarted && gameInfo?.owner !== address && (
        <p className="font-bold">Waiting for leader to start de game...</p>
      )}
      {gameInfo && (
        <Table
          id={id}
          started={gameStarted}
          address={address}
          players={gameInfo.players || []}
          hotPotatoBalances={hotPotatoBalances}
          // players={[
          //   "0x67E251A961e861F440b4673361Aa9B110A581285",
          //   "0x67E251A961e861F440b4673361Aa9B110A581285",
          //   "0x67E251A961e861F440b4673361Aa9B110A581285",
          //   "0x67E251A961e861F440b4673361Aa9B110A581285",
          //   "0x67E251A961e861F440b4673361Aa9B110A581285",
          //   "0x67E251A961e861F440b4673361Aa9B110A581285",
          //   "0x67E251A961e861F440b4673361Aa9B110A581285",
          // ]}
          owner={gameInfo.owner}
          contract={hotPotatoContract}
        />
      )}
    </div>
  );
}

export default Game;
