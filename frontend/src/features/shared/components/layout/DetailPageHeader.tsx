import React from "react";
import { BackButton } from "@features/shared/components";
import { useNavigate } from "react-router";

interface DetailPageHeaderProps {
  title: string;
  subTitle?: string | React.ReactNode;
  description?: React.ReactNode;
  backLabel?: string;
  onBack?: () => void;
  className?: string;
  rightAction?: React.ReactNode; // Azione opzionale a destra (es. pulsante)
}

export const DetailPageHeader: React.FC<DetailPageHeaderProps> = ({
  title,
  subTitle,
  description,
  backLabel = "Torna indietro",
  onBack,
  className = "",
  rightAction,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const renderDescription = () => {
    if (typeof description === "string") {
      return <p className="text-muted-foreground">{description}</p>;
    }
    return description;
  };

  return (
    <div>
      <div
        className={`flex flex-wrap items-center gap-2 lg:grid lg:grid-cols-3 lg:gap-0 ${className}`}
      >
        <div className="shrink-0 w-full sm:w-auto md:w-auto">
          <BackButton onBack={handleBack} label={backLabel} />
        </div>
        <div className="flex flex-col items-center justify-center flex-1 min-w-0 md:flex-none">
          <h1 className="text-2xl font-bold text-center">{title}</h1>
          {subTitle && (
            <div className="text-sm text-muted-foreground mt-1">
              {typeof subTitle === "string" ? <p>{subTitle}</p> : subTitle}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end shrink-0 w-full sm:w-auto md:w-auto md:flex md:justify-end">
          {rightAction}
        </div>
      </div>
      {renderDescription()}
    </div>
  );
};
