"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { formatCurrency, generateSlugUrl } from "@/lib/utils";
import { DishListResType } from "@/schemaValidations/dish.schema";
import { Link } from "@/i18n/routing";

export default function DishGrid({
  dishes,
}: {
  dishes: DishListResType["data"];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {dishes.map((dish, index) => (
        <Link
          href={`/dishes/${generateSlugUrl({
            name: dish.name,
            id: dish.id,
          })}`}
          key={dish.id}
        >
          <motion.div
            key={dish.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Card className="overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition duration-300 border border-gray-800 bg-[#0f0f0f]">
              <div className="relative w-full h-[260px] overflow-hidden group">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                  <h3 className="text-lg font-semibold">{dish.name}</h3>
                  <p className="text-sm opacity-80">{dish.description}</p>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-base font-semibold text-white">
                  {formatCurrency(dish.price)}
                </span>
              </div>
            </Card>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
