import { useState, useEffect } from "react";
import Button from "./Button";
import Label from "./Label";
import { MAX_FUTURE_EXPIRATION_TIME_DAYS } from "../constants";
import { Clock, Cross } from "./icons";
import dayjs from "dayjs";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import enGB from "date-fns/locale/en-GB";

function CreateGameForm({ createGame, disabled }) {
  const [creating, setCreating] = useState(false);
  const [expirationDate, setExpirationDate] = useState(null);

  useEffect(() => {
    registerLocale("en-GB", enGB);
  });

  const handleCreate = async () => {
    setCreating(true);
    await createGame(expirationDate);
    setCreating(false);
  };

  return (
    <div className="flex flex-col space-y-7 mt-5">
      <div>
        <Label htmlFor="create-game-expiration-date">
          Game expiration date
        </Label>

        <div className="flex items-center justify-between border border-gray-200 rounded-lg shadow-sm bg-white px-4 py-1.5">
          <DatePicker
            id="create-game-expiration-date"
            selected={expirationDate}
            onChange={setExpirationDate}
            locale="en-GB"
            placeholderText="Select date"
            autoComplete="off"
            minDate={dayjs().toDate()}
            maxDate={dayjs()
              .add(MAX_FUTURE_EXPIRATION_TIME_DAYS, "day")
              .toDate()}
          />
          <button onClick={() => setExpirationDate(null)}>
            {expirationDate ? (
              <Cross className="w-5 h-5" />
            ) : (
              <span className="w-5 h-5"></span>
            )}
          </button>
        </div>
      </div>

      <Button
        onClick={handleCreate}
        loading={creating}
        disabled={disabled}
        unselectable={!expirationDate}
        className="w-full"
      >
        Create!
      </Button>
    </div>
  );
}

export default CreateGameForm;
