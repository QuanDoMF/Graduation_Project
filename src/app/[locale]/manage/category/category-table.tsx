'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import DOMPurify from 'dompurify'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createContext, useContext, useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  formatCurrency,
  handleErrorApi
} from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import AutoPagination from '@/components/auto-pagination'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import EditCategory from '@/app/[locale]/manage/category/edit-category'
import AddCategory from '@/app/[locale]/manage/category/add-category'
import { useDeleteCategoryMutation, useCategoryListQuery } from '@/queries/useCategory'
import { toast } from '@/components/ui/use-toast'
import { usePathname, useRouter } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { Locale } from '@/config'

type CategoryItem = CategoryListResType['data'][0]

const CategoryTableContext = createContext<{
  setCategoryIdEdit: (value: number) => void
  categoryIdEdit: number | undefined
  categoryDelete: CategoryItem | null
  setCategoryDelete: (value: CategoryItem | null) => void
}>({
  setCategoryIdEdit: (value: number | undefined) => {},
  categoryIdEdit: undefined,
  categoryDelete: null,
  setCategoryDelete: (value: CategoryItem | null) => {}
})

export const columns: ColumnDef<CategoryItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'name',
    header: () => <div className="text-center">Tên danh mục</div>,
    cell: ({ row }) => <div className='capitalize text-center'>{row.getValue('name')}</div>
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setCategoryIdEdit, setCategoryDelete } = useContext(CategoryTableContext)
      const openEditCategory = () => {
        setCategoryIdEdit(row.original.id)
      }

      const openDeleteCategory = () => {
        setCategoryDelete(row.original)
      }
      return (
        <div className="text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <DotsHorizontalIcon className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openEditCategory}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteCategory}>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      )
    }
  }
]

function AlertDialogDeleteCategory({
  categoryDelete,
  setCategoryDelete
}: {
  categoryDelete: CategoryItem | null
  setCategoryDelete: (value: CategoryItem | null) => void
}) {
  const { mutateAsync } = useDeleteCategoryMutation()
  const deleteCategory = async () => {
    if (categoryDelete) {
      try {
        const result = await mutateAsync(categoryDelete.id)
        setCategoryDelete(null)
        toast({
          title: result.payload.message
        })
      } catch (error) {
        handleErrorApi({
          error
        })
      }
    }
  }
  return (
    <AlertDialog
      open={Boolean(categoryDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setCategoryDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
          <AlertDialogDescription>
            Món{' '}
            <span className='bg-foreground text-primary-foreground rounded px-1'>
              {categoryDelete?.name}
            </span>{' '}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteCategory}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10
export default function CategoryTable() {
  const searchParam = useSearchParams()
  const router = useRouter()
  const locale = useLocale()
  const pathname = usePathname();
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  const [categoryIdEdit, setCategoryIdEdit] = useState<number | undefined>()
  const [categoryDelete, setCategoryDelete] = useState<CategoryItem | null>(null)
  const categoryListQuery = useCategoryListQuery()
  const data = categoryListQuery.data?.payload.data ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE //default page size
  })

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    }
  })

  useEffect(() => {
    // Check và redirect nếu current page > total page sau khi data thay đổi
    const totalItem = data.length
    const totalPage = Math.ceil(totalItem / PAGE_SIZE)
    const currentPage = table.getState().pagination.pageIndex + 1 // pageIndex là 0-based
  
    if (currentPage > totalPage && totalPage > 0) {
      const params = new URLSearchParams(searchParam.toString())
      params.set('page', totalPage.toString())
      const pathWithQuery = `/${pathname}?${params.toString()}`
      router.replace(pathWithQuery)
    }
  }, [data, table, router, locale])

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE
    })
  }, [table, pageIndex])

  return (
    <CategoryTableContext.Provider
      value={{ categoryIdEdit, setCategoryIdEdit, categoryDelete, setCategoryDelete }}
    >
      <div className='w-full'>
        <EditCategory id={categoryIdEdit} setId={setCategoryIdEdit} />
        <AlertDialogDeleteCategory
          categoryDelete={categoryDelete}
          setCategoryDelete={setCategoryDelete}
        />
        <div className='flex items-center py-4'>
          <Input
            placeholder='Lọc tên'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddCategory />
          </div>
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex items-center justify-end space-x-2 py-4'>
          <div className='text-xs text-muted-foreground py-4 flex-1 '>
            Hiển thị{' '}
            <strong>{table.getPaginationRowModel().rows.length}</strong> trong{' '}
            <strong>{data.length}</strong> kết quả
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname='/manage/category'
            />
          </div>
        </div>
      </div>
    </CategoryTableContext.Provider>
  )
}
