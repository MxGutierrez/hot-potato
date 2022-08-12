import { useState, useEffect } from "react";
import Button from "./Button";
import Label from "./Label";
import Spinner from "./Spinner";
import FormError from "./FormError";
import { GAME_ID_DIGITS, MAX_PLAYERS_IN_GAME } from "../constants";
import { useDebounce } from "../hooks";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Calendar, Clock, Search, Cross } from "./icons";
import dayjs from "dayjs";
import clsx from "clsx";

function JoinGameForm({ address, joinGame, contract, disabled }) {
  const [gameId, setGameId] = useState("");
  const debouncedGameId = useDebounce(gameId, 300);

  const [joining, setJoining] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleJoin = async () => {
    setJoining(true);
    await joinGame(gameId);
    setJoining(false);
  };

  useEffect(() => {
    if (!debouncedGameId || debouncedGameId.length !== GAME_ID_DIGITS) {
      return;
    }

    const getGame = async () => {
      setSearching(true);
      try {
        const [players, gameInfo] = await Promise.all([
          contract.methods.getPlayers(debouncedGameId).call(),
          contract.methods._games(debouncedGameId).call(),
        ]);

        if (gameInfo.createdAt === "0") {
          setSearchError("No games found for that ID");
        } else if (players.includes(address)) {
          setSearchError("You're already in this game");
        } else {
          setSearchResult({
            createdAt: gameInfo.createdAt,
            owner: gameInfo.owner,
            expiresAt: gameInfo.expiresAt,
            players,
          });
        }
      } catch (ex) {
        console.log(ex);
      } finally {
        setSearching(false);
      }
    };

    getGame();
  }, [debouncedGameId]);

  useEffect(() => {
    if (!gameId || gameId.length !== 8) {
      setSearchResult(null);
    }
    setSearchError(null);
  }, [gameId]);

  return (
    <div className="flex flex-col space-y-7 mt-5">
      <div>
        <Label htmlFor="join-game-id">Game ID</Label>
        <div
          className={clsx(
            "flex items-center border border-gray-200 rounded-lg shadow-sm bg-white px-4 py-1 space-x-2.5",
            { "border border-red-600": searchError }
          )}
        >
          {searching ? (
            <Spinner className="w-5 h-4 text-primary" />
          ) : (
            <Search className="w-5 h-5" />
          )}

          <input
            id="join-game-id"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="py-0.5 flex-1"
            autoComplete="off"
            placeholder="12345678"
          />
          <button onClick={() => setGameId("")}>
            {gameId ? (
              <Cross className="w-5 h-5" />
            ) : (
              <span className="w-5 h-5"></span>
            )}
          </button>
        </div>
        {searchError && <FormError>{searchError}</FormError>}
      </div>

      {searchResult && (
        <div className="border border-gray-200 shadow-sm bg-white rounded-lg py-3 px-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <p>
              {dayjs(searchResult.createdAt * 1000).format("MMM D, YYYY HH:mm")}
            </p>
          </div>
          <div className="flex items-center space-x-2 my-2">
            <Clock className="w-5 h-5" />
            <p>
              {dayjs(searchResult.expiresAt * 1000).format("MMM D, YYYY HH:mm")}
            </p>
          </div>
          <div>
            <h6 className="font-semibold mb-1 flex items-center">
              Players in game
              <span className="font-light text-xs ml-1.5">
                ({searchResult.players.length}/{MAX_PLAYERS_IN_GAME})
              </span>
            </h6>
            {searchResult.players.map((address) => (
              <div key={address} title={address}>
                <Jazzicon diameter={20} seed={jsNumberForAddress(address)} />
              </div>
            ))}
          </div>
        </div>
      )}
      <Button
        onClick={handleJoin}
        loading={joining}
        disabled={disabled}
        unselectable={!searchResult || searchError}
      >
        Join!
      </Button>
    </div>
  );
}

export default JoinGameForm;
