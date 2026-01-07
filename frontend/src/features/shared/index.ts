export * from "./components/Logo";
export * from "./components/NotificationBadge";
export * from "./components/TimerBadge";
export * from "./components/ThemeToggle";
export * from "./components/UserMenu";

// Mock useIsMobile for now
export const useIsMobile = () => {
    return false;
};

// Mock useToast for now
export const useToast = () => {
    return {
        toast: (props: any) => console.log("Toast:", props),
        toasts: [] as any[],
        dismiss: (id?: string) => console.log("Dismiss:", id)
    };
};
