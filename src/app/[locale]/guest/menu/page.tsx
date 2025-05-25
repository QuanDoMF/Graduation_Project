import MenuOrder from "@/app/[locale]/guest/menu/menu-order";
import envConfig, { Locale } from "@/config";
import { baseOpenGraph } from "@/shared-metadata";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "GuestMenu",
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/guest/menu`;

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      ...baseOpenGraph,
      title: t("title"),
      description: t("description"),
      url,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: false,
    },
  };
}

export default async function MenuPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: "GuestMenu",
  });
  return (
    <div className="max-w-[500px] mx-auto space-y-4">
      <div className="bg-gradient-to-r from-green-500 to-green-400 rounded-lg shadow-lg shadow-green-500/50">
        <h1 className="text-center text-2xl font-extrabold text-white py-4 relative shadow-lg shadow-green-500/50">
          {t("description")}
          <span className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-full"></span>
        </h1>
      </div>
      <MenuOrder />
    </div>
  );
}
