import OrdersCart from "@/app/[locale]/guest/orders/orders-cart";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function OrdersPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: "GuestOrder",
  });
  return (
    <>
      <div className="max-w-[400px] mx-auto space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-400 rounded-lg shadow-lg shadow-green-500/50">
          <h1 className="text-center text-2xl font-extrabold text-white py-4 relative shadow-lg shadow-green-500/50">
            {t("description")}
            <span className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-full"></span>
          </h1>
        </div>
        <OrdersCart />
      </div>
    </>
  );
}
