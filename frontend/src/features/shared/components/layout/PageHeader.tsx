/**
 * PageHeader Component
 *
 * Header riutilizzabile per le pagine con titolo e pulsanti opzionali.
 */

import {
  type RefreshButtonProps,
  type PrimaryButtonProps,
  RefreshButton,
  PrimaryButton,
} from "../index";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  refreshButton?: RefreshButtonProps;
  createButton?: PrimaryButtonProps;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  refreshButton,
  createButton,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {refreshButton && (
          <RefreshButton
            refetch={refreshButton.refetch}
            isLoading={refreshButton.isLoading}
          />
        )}
        {createButton && (
          <PrimaryButton
            text={createButton.text}
            onClick={createButton.onClick}
            icon={createButton.icon}
            showIcon={createButton.showIcon}
            disabled={createButton.disabled}
            className={createButton.className}
          />
        )}
      </div>
    </div>
  );
};
