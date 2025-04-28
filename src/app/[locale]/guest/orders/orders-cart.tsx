'use client'

import { useAppStore } from '@/components/app-provider'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { OrderStatus, OrderStatusType } from "@/constants/type";
import { formatCurrency, getEnglistOrderStatus, getVietnameseOrderStatus } from '@/lib/utils'
import { useGuestGetOrderListQuery } from '@/queries/useGuest'
import {
  PayGuestOrdersResType,
  UpdateOrderResType
} from '@/schemaValidations/order.schema'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect, useMemo } from 'react'

export default function OrdersCart() {
  const { data, refetch } = useGuestGetOrderListQuery()
  const orders = useMemo(() => data?.payload.data ?? [], [data])
  const socket = useAppStore((state) => state.socket)
  const t = useTranslations("GuestOrder");
  const locale = useLocale()
  const { waitingForPaying, paid } = useMemo(() => {
    return orders.reduce(
      (result, order) => {
        if (
          order.status === OrderStatus.Delivered ||
          order.status === OrderStatus.Processing ||
          order.status === OrderStatus.Pending
        ) {
          return {
            ...result,
            waitingForPaying: {
              price:
                result.waitingForPaying.price +
                order.dishSnapshot.price * order.quantity,
              quantity: result.waitingForPaying.quantity + order.quantity
            }
          }
        }
        if (order.status === OrderStatus.Paid) {
          return {
            ...result,
            paid: {
              price:
                result.paid.price + order.dishSnapshot.price * order.quantity,
              quantity: result.paid.quantity + order.quantity
            }
          }
        }
        return result
      },
      {
        waitingForPaying: {
          price: 0,
          quantity: 0
        },
        paid: {
          price: 0,
          quantity: 0
        }
      }
    )
  }, [orders])

  useEffect(() => {
    if (socket?.connected) {
      onConnect()
    }

    function onConnect() {
      console.log(socket?.id)
    }

    function onDisconnect() {
      console.log('disconnect')
    }
    function onUpdateOrder(data: UpdateOrderResType['data']) {
      const {
        dishSnapshot: { name },
        quantity,
        status
      } = data

      const statusMessage =
        locale === 'vi'
          ? getVietnameseOrderStatus(status)
          : getEnglistOrderStatus(status)
      toast({
        description: t('updateOrderToast', {
          name,
          quantity,
          status: statusMessage
        })
      })
      refetch()
    }

    function onPayment(data: PayGuestOrdersResType['data']) {
      const { guest } = data[0]
      toast({
        description: t('paymentToast', {
          guestName: guest?.name ?? '',
          tableNumber: guest?.tableNumber ?? '',
          count: data.length
        })
      })
      refetch()
    }

    socket?.on('update-order', onUpdateOrder)
    socket?.on('payment', onPayment)
    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)

    return () => {
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('update-order', onUpdateOrder)
      socket?.off('payment', onPayment)
    }
  }, [refetch, socket])
  return (
    <>
      {orders.map((order, index) => (
        <div key={order.id} className='flex gap-4'>
          <div className='text-sm font-semibold'>{index + 1}</div>
          <div className='flex-shrink-0 relative'>
            <Image
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              height={100}
              width={100}
              quality={100}
              className='object-cover w-[80px] h-[80px] rounded-md'
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              {order.dishSnapshot.name}
            </h3>

            <div className="flex items-center text-sm text-white">
              <span className="font-semibold text-yellow-400">
                {formatCurrency(order.dishSnapshot.price)}
              </span>
              <span className="mx-2 ">x</span>
              <Badge className="bg-green-500 text-white px-2 py-1 rounded-full font-medium shadow-md flex items-center justify-center">
                {order.quantity}
              </Badge>
            </div>
          </div>
          <div className="flex-shrink-0 ml-auto flex justify-center items-center">
            <Badge variant={"outline"}>
              {t(order.status.toLowerCase() as Lowercase<OrderStatusType>)}
            </Badge>
          </div>
        </div>
      ))}
      {paid.quantity !== 0 && (
        <div className="sticky bottom-0">
          <div className="w-full flex justify-between text-xl font-semibold">
            <span>
              {t("paidStatus")} · {paid.quantity} {t("itemCount")}
            </span>
            <span className="ml-3">{formatCurrency(paid.price)}</span>
          </div>
        </div>
      )}
      <div className="sticky bottom-0">
        <div className="w-full flex justify-between text-xl font-semibold">
          <span>
            {t("unpaid")} · {waitingForPaying.quantity} {t("itemCount")}
          </span>
          <span className="ml-3">{formatCurrency(waitingForPaying.price)}</span>
        </div>
      </div>
    </>
  );
}