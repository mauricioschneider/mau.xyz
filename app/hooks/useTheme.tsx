import { useState } from "react";

function useTheme() {
  const [theme, setTheme] = useState("light");
  return {
    resolvedTheme: theme,
    setTheme,
  };
}

export { useTheme };
