import { useCallback, useState } from "react";

export const useDialog = () => {
  const [isShown, setIsShown] = useState(false);

  const openDialog = useCallback(() => {
    setIsShown(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsShown(false);
  }, []);

  const onOpenChange = useCallback((open: boolean) => {
    setIsShown(open);
  }, []);

  return { isShown, openDialog, closeDialog, onOpenChange };
};
