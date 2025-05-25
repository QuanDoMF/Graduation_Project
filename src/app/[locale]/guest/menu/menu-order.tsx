"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useDishListQuery } from "@/queries/useDish";
import {
  cn,
  formatCurrency,
  handleErrorApi,
  capitalizeFirstLetter,
  normalizeCategoryKey,
  getCategoryTranslation,
} from "@/lib/utils";
import Quantity from "@/app/[locale]/guest/menu/quantity";
import { useMemo, useState } from "react";
import { GuestCreateOrdersBodyType } from "@/schemaValidations/guest.schema";
import { useGuestOrderMutation } from "@/queries/useGuest";
import { DishStatus } from "@/constants/type";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useCategoryListQuery } from "@/queries/useCategory";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MenuOrder() {
  const { data } = useDishListQuery();
  const dishes = useMemo(() => data?.payload.data ?? [], [data]);
  const { data: categoryRes } = useCategoryListQuery();
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const { mutateAsync } = useGuestOrderMutation();
  const t = useTranslations("GuestMenu");
  const router = useRouter();

  const categories = useMemo(() => {
    const raw = categoryRes?.payload.data ?? [];

    return [...raw].sort((a, b) => {
      const aName = a.name.trim().toLowerCase();
      const bName = b.name.trim().toLowerCase();

      if (aName === "khác") return 1;
      if (bName === "khác") return -1;

      return a.name.localeCompare(b.name, "vi", { sensitivity: "base" });
    });
  }, [categoryRes]);
  // React 19 hoặc Next.js 15 thì không cần dùng useMemo chỗ này
  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = orders.find((order) => order.dishId === dish.id);
      if (!order) return result;
      return result + order.quantity * dish.price;
    }, 0);
  }, [dishes, orders]);

  const handleQuantityChange = (dishId: number, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dishId !== dishId);
      }
      const index = prevOrders.findIndex((order) => order.dishId === dishId);
      if (index === -1) {
        return [...prevOrders, { dishId, quantity }];
      }
      const newOrders = [...prevOrders];
      newOrders[index] = { ...newOrders[index], quantity };
      return newOrders;
    });
  };

  const handleOrder = async () => {
    try {
      await mutateAsync(orders);
      router.push(`/guest/orders`);
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  const filteredDishes = useMemo(() => {
    return dishes.filter(
      (d) =>
        d.status !== DishStatus.Hidden &&
        (selectedCategoryId === null || d.categoryId === selectedCategoryId)
    );
  }, [dishes, selectedCategoryId]);
  return (
    <div className="flex w-full gap-4 ">
      {/* Sidebar danh mục */}
      <aside className=" md:block max-w-[170px] bg-slate-900 border-r border-slate-800 p-2 rounded-md">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-2">
            <Button
              variant={selectedCategoryId === null ? "default" : "ghost"}
              className="w-full justify-start "
              onClick={() => setSelectedCategoryId(null)}
            >
              {t("all")}
            </Button>
            {categories.map((cat) => {
              const key = normalizeCategoryKey(cat.name);
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategoryId === cat.id ? "default" : "ghost"}
                  className="w-full justify-start capitalize"
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  {getCategoryTranslation(t, cat.name)}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      {/* Danh sách món */}
      <main
        className={cn(
          "flex-1 min-w-[250px] ",
          filteredDishes.length === 0
            ? "flex items-center justify-center"
            : "flex flex-col justify-between space-y-4"
        )}
      >
        {filteredDishes.length === 0 ? (
          <div className="text-center text-white text-sm italic">
            {t("noResult")}
          </div>
        ) : (
          <>
            <div className="space-y-4 flex-1">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className={cn("flex gap-4", {
                    "pointer-events-none opacity-50":
                      dish.status === DishStatus.Unavailable,
                  })}
                >
                  <div className="flex-shrink-0 relative">
                    {dish.status === DishStatus.Unavailable && (
                      <span className="absolute inset-0 flex items-center justify-center text-sm italic text-white bg-black bg-opacity-50 rounded-md p-2 shadow-lg">
                        {t("soldOut")}
                      </span>
                    )}
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      width={80}
                      height={80}
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="space-y-1 text-sm text-white">
                    <h3 className="font-semibold">{dish.name}</h3>
                    <p className="text-xs text-slate-300">{dish.description}</p>
                    <p className="font-medium text-green-400">
                      {formatCurrency(dish.price)}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center">
                    <Quantity
                      value={
                        orders.find((o) => o.dishId === dish.id)?.quantity ?? 0
                      }
                      onChange={(value) => handleQuantityChange(dish.id, value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Nút đặt hàng */}
            <div className="sticky bottom-0 bg-gray-400 rounded-[5px] radius z-10">
              <Button
                className="w-full justify-between"
                onClick={handleOrder}
                disabled={orders.length === 0}
              >
                <span>
                  {t("action")} · {orders.length} {t("itemCount")}
                </span>
                <span>{formatCurrency(totalPrice)}</span>
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
