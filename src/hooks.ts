import { useState } from "react";

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((v: any) => value + 1); // update the state to force render
}

export default useForceUpdate;
