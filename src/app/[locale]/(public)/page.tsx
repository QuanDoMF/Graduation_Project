export const dynamic = "force-static";
export const revalidate = false;
import dishApiRequest from "@/apiRequests/dish";
import { formatCurrency } from "@/lib/utils";
import { htmlToTextForDescription } from "@/lib/server-utils";
import { DishListResType } from "@/schemaValidations/dish.schema";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import DishGrid from "@/components/DishGrid";
import {
  AnimatedBannerText,
  AnimatedSectionHeading,
} from "@/components/animatedHeading";
import { getTranslations, setRequestLocale } from "next-intl/server";
import envConfig, { Locale } from "@/config";

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}`;
  return {
    title: t("title"),
    description: htmlToTextForDescription(t("description")),
    alternates: {
      canonical: url,
    },
  };
}

export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  setRequestLocale(locale);
  const t = await getTranslations("HomePage");
  let dishList: DishListResType["data"] = [];
  try {
    const result = await dishApiRequest.list();
    const {
      payload: { data },
    } = result;
    dishList = data;
  } catch (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Có lỗi xảy ra khi tải dữ liệu món ăn.
      </div>
    );
  }
  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-[320px] md:h-[450px] lg:h-[840px] justify-self-center md:w-[94%] lg:w-[94%]">
        <Image
          src="/banner.png"
          fill
          alt="Banner"
          className="object-fill z-0 brightness-50"
        />
        <AnimatedBannerText />
      </div>

      {/* Grid */}
      <section className="py-16 px-4 sm:px-8 md:px-20">
        <AnimatedSectionHeading />
        <DishGrid dishes={dishList} />
      </section>
    </div>
  );
}
