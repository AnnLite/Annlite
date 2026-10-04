import { MapPinOff } from "lucide-react";
import { useApp } from "../state/AppProvider";
import { EmptyState, LinkButton } from "../components/ui";

export default function NotFoundPage() {
  const { t } = useApp();
  return (
    <div className="app-page not-found-page">
      <EmptyState icon={<MapPinOff size={26} />} title={t("page.notFound.title")} description={t("page.notFound.description")} action={<LinkButton to="/">{t("common.backHome")}</LinkButton>} />
    </div>
  );
}