import { useEffect, useRef } from "react";

export type UserKeyboardInputKeysDown = Record<KeyboardEvent["key"], boolean>;

export default function useUserControls(): UserKeyboardInputKeysDown {
  const userKeyboardInputKeysDown = useRef<UserKeyboardInputKeysDown>({});

  useEffect(() => {
    const trackUserKeyboardInputKeysDown = (event: KeyboardEvent): void => {
      userKeyboardInputKeysDown.current[event.key] = true;
    };

    const trackUserKeybaordInputKeysUp = (event: KeyboardEvent): void => {
      userKeyboardInputKeysDown.current[event.key] = false;
    };

    window.addEventListener("keydown", trackUserKeyboardInputKeysDown);
    window.addEventListener("keyup", trackUserKeybaordInputKeysUp);

    return () => {
      window.removeEventListener("keydown", trackUserKeyboardInputKeysDown);
      window.removeEventListener("keyup", trackUserKeybaordInputKeysUp);
    };
  }, []);

  return userKeyboardInputKeysDown.current;
}
