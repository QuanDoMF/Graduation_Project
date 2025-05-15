'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { handleErrorApi } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  UpdateCategoryBody,
  UpdateCategoryBodyType
} from '@/schemaValidations/category.schema'
import { Textarea } from '@/components/ui/textarea'
import { useGetCategoryQuery, useUpdateCategoryMutation } from '@/queries/useCategory'
import { toast } from '@/components/ui/use-toast'
import revalidateApiRequest from '@/apiRequests/revalidate'

export default function EditCategory({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const updateCategoryMutation = useUpdateCategoryMutation()
  const { data } = useGetCategoryQuery({ enabled: Boolean(id), id: id as number })
  const form = useForm<UpdateCategoryBodyType>({
    resolver: zodResolver(UpdateCategoryBody),
    defaultValues: {
      name: '',
    }
  })


  useEffect(() => {
    console.log("🚀 ~ useEffect ~ data:", data)
    if (data) {
      console.log("🚀 ~ useEffect ~ data:", data)
      const { name } = data.payload.data
      form.reset({
        name,
      })
    }
  }, [data, form])
  const onSubmit = async (values: UpdateCategoryBodyType) => {
    if (updateCategoryMutation.isPending) return
    try {
      let body: UpdateCategoryBodyType & { id: number } = {
        id: id as number,
        ...values
      }
      const result = await updateCategoryMutation.mutateAsync(body)
      await revalidateApiRequest('categories')
      toast({
        description: result.payload.message
      })
      reset()
      onSubmitSuccess && onSubmitSuccess()
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  const reset = () => {
    setId(undefined)
  }

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
      }}
    >
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Cập nhật danh mục</DialogTitle>
          <DialogDescription>
            Các trường sau đây là bắ buộc: Tên
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8'
            id='edit-category-form'
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='name'>Tên danh mục</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='name' className='w-full' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='edit-category-form'>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
