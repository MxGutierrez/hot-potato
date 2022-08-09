import { useReducer } from "react";
import GameContext from "./context";
import { reducer, initialState } from "./state";

function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GameContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export default GameProvider;
