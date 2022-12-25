import { useEffect, useState } from "react";
import clsx from "clsx";
import Button from "./Button";
import Table from "./Table";
import Label from "./Label";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Clipboard } from "./icons";
import { POTATO_DECIMALS } from "../constants";

function Game({ id, address, hotPotatoGameContract, hotPotatoContract }) {
  const [startingGame, setStartingGame] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEndData, setGameEndData] = useState(null);
  const [gameInfo, setGameInfo] = useState(null);
  const [gameIdCopied, setGameIdCopied] = useState(false);
  const [fetchingGameInfo, setFetchingGameInfo] = useState(false);
  const [claimingWin, setClaimingWin] = useState(false);
  const [claimedWin, setClaimedWin] = useState(false);

  const startGame = async () => {
    setStartingGame(true);
    try {
      await hotPotatoGameContract.methods.startGame(id).send({ from: address });
    } catch (ex) {
      console.log("error", ex);
    } finally {
      setStartingGame(false);
    }
  };

  const claimWin = async () => {
    setClaimingWin(true);
    try {
      await hotPotatoGameContract.methods.claimWin(id).send({ from: address });
      setClaimedWin(true);
    } catch (ex) {
      console.log("error", ex);
    } finally {
      setClaimingWin(false);
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

      hotPotatoGameContract.events.GameEnded(
        {
          filter: { gameId: id },
        },
        (err, res) => {
          if (err) {
            console.log(err);
            return;
          }

          console.log(res);

          setGameEndData(res.returnValues);
        }
      ),
    ];

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [gameInfo]);

  return (
    <div className="flex flex-col space-y-3 flex-1">
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
        <Button
          onClick={startGame}
          loading={startingGame}
          className="w-[200px]"
        >
          Start game
        </Button>
      )}
      {!gameStarted && gameInfo?.owner !== address && (
        <p className="font-bold">Waiting for leader to start de game...</p>
      )}
      {gameEndData && (
        <div className="space-y-6 !mt-9 bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-6">
          <h2 className="font-semibold text-xl">Game has ended!</h2>
          <div className="flex items-center">
            <p className={clsx({ "mr-2": gameEndData.loser !== address })}>
              {gameEndData.loser === address ? "You" : "Player"}
            </p>
            {gameEndData.loser !== address && (
              <Jazzicon
                diameter={35}
                seed={jsNumberForAddress(gameEndData.loser)}
              />
            )}
            <p
              className={clsx(gameEndData.loser !== address ? "ml-2" : "ml-1")}
            >
              couldn't handle the heat of the hot potato,{" "}
              {gameEndData.loser === address
                ? "better luck next time!"
                : "congratulations on the win!"}
            </p>
          </div>
          {gameEndData.loser !== address && !claimedWin && (
            <Button
              onClick={claimWin}
              loading={claimingWin}
              className="w-[200px]"
            >
              Claim {(gameEndData.winAmount / 10 ** POTATO_DECIMALS).toFixed(2)}{" "}
              potatoes
            </Button>
          )}
          {claimedWin && (
            <p className="font-bold">You have claimed your win!</p>
          )}
        </div>
      )}
      {gameInfo && (
        <div className="flex items-center justify-center flex-1">
          <Table
            id={id}
            started={gameStarted}
            ended={gameEndData !== null}
            address={address}
            players={gameInfo.players || []}
            owner={gameInfo.owner}
            contract={hotPotatoContract}
          />
        </div>
      )}
    </div>
  );
}

export default Game;
