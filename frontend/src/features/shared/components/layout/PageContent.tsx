/**
 * PageContent Component
 *
 * Wrapper riutilizzabile per garantire padding e spacing consistenti
 * in tutte le pagine dell'applicazione.
 */

export const PageContent: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return <div className="mx-auto px-4 py-0 space-y-4">{children}</div>;
};
