import { useContext } from "react";
import GameContext from "./context";

const useGame = () => useContext(GameContext);

export default useGame;
