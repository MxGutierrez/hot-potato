import { useState, useEffect } from "react";
import Button from "./Button";
import { GAME_ID_DIGITS, MAX_PLAYERS_IN_GAME } from "../constants";
import { useDebounce } from "../hooks";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Calendar, Clock, Search, Cross } from "./icons";
import dayjs from "dayjs";

function JoinGameForm({ joinGame, contract }) {
  const [gameId, setGameId] = useState("");
  const debouncedGameId = useDebounce(gameId, 300);

  const [joining, setJoining] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

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

        setSearchResult({
          createdAt: gameInfo.createdAt,
          owner: gameInfo.owner,
          expiresOn: gameInfo.expiresAt,
          players,
        });
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
  }, [gameId]);

  return (
    <div className="flex flex-col space-y-4 mt-4">
      <div className="flex items-center border border-gray-200 rounded-lg shadow-sm bg-white px-4 py-1 space-x-2.5">
        <Search className="w-5 h-5" />
        <input
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          className="py-0.5 flex-1"
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
              {dayjs()
                .add(searchResult.expiresOn, "second")
                .format("MMM D, YYYY HH:mm")}
            </p>
          </div>
          <div>
            <h6 className="font-semibold mb-1 flex items-center">
              Players in game
              <span className="font-light text-xs ml-1.5">
                (1/{MAX_PLAYERS_IN_GAME})
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
      {searching && <p>searching</p>}
      {gameId && (
        <Button onClick={handleJoin} loading={joining}>
          Join!
        </Button>
      )}
    </div>
  );
}

export default JoinGameForm;
