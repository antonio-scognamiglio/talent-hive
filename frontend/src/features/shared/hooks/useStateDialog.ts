/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";

type DialogState<T = any> = {
  isOpen: boolean;
  selectedItem: T | null;
  type: string | null;
};

type DialogResult<T = any> = {
  selectedItem: T | null;
  openDialog: (selectedItem: T | null, type: string) => void;
  closeDialog: () => void;
  isDialogOpen: (type: string) => boolean;
  refreshDialogData: (newSelectedItem: T | null) => void;
};

export function useStateDialog<T = any>(
  dialogTypes: string[],
): DialogResult<T> {
  const [state, setState] = useState<DialogState<T>>({
    isOpen: false,
    selectedItem: null,
    type: null,
  });

  const openDialog = useCallback(
    (selectedItem: T | null, type: string) => {
      if (!dialogTypes.includes(type)) {
        console.warn(
          `Dialog type "${type}" not found in available types: ${dialogTypes.join(
            ", ",
          )}`,
        );
        return;
      }
      setState({ isOpen: true, selectedItem, type });
    },
    [dialogTypes],
  );

  const closeDialog = useCallback(() => {
    setState({ isOpen: false, selectedItem: null, type: null });
  }, []);

  const isDialogOpen = useCallback(
    (type: string) => {
      return state.isOpen && state.type === type;
    },
    [state.isOpen, state.type],
  );

  const refreshDialogData = useCallback(
    (newSelectedItem: T | null) => {
      if (!state.isOpen) {
        console.warn("Cannot refresh dialog data: no dialog is currently open");
        return;
      }

      setState({ ...state, selectedItem: newSelectedItem });
    },
    [state],
  );

  return {
    selectedItem: state.selectedItem,
    openDialog,
    closeDialog,
    isDialogOpen,
    refreshDialogData,
  };
}
