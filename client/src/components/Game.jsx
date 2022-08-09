import useGame from "../contexts/game/use";

function Game() {
  const { id } = useGame();
  return <h1>Game: {id}</h1>;
}

export default Game;
