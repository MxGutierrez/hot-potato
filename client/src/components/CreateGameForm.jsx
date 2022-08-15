import { useState } from "react";
import Button from "./Button";

function CreateGameForm({ createGame, disabled }) {
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    await createGame();
    setCreating(false);
  };

  return (
    <div className="flex flex-col space-y-7 mt-5">
      <Button
        onClick={handleCreate}
        loading={creating}
        disabled={disabled}
        className="w-full"
      >
        Create!
      </Button>
    </div>
  );
}

export default CreateGameForm;
