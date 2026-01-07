import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguageContext } from "@/features/language";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguageContext();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          {t("pages.not_found_desc")}
        </p>
        <Button asChild>
          <Link to="/">{t("pages.return_home")}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
