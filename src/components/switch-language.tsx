"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Locale, locales } from "@/config";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";

export default function SwitchLanguage() {
  const t = useTranslations("SwitchLanguage");
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParmas = useSearchParams();

  const handleChangeLanguage = (value: string) => {
    const queryString = searchParmas.toString();
    const pathWithQuery = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(pathWithQuery, { locale: value as Locale });
    router.refresh();
  };
  return (
    <Select value={locale} onValueChange={handleChangeLanguage}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder={t("title")} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {locales.map((locale) => (
            <SelectItem value={locale} key={locale}>
              {t(locale)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
