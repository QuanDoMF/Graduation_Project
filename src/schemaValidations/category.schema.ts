import z from 'zod'

export const CreateCategoryBody = z.object({
    name: z.string().min(1).max(256),
})
export type CreateCategoryBodyType = z.TypeOf<typeof CreateCategoryBody>


export const UpdateCategoryBody = CreateCategoryBody
export type UpdateCategoryBodyType = CreateCategoryBodyType

export const categorySchema = z.object({
    id: z.number(),
    name: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
})

export const CategoryRes = z.object({
    data: categorySchema,
    message: z.string()
})

export type CategoryResType = z.TypeOf<typeof CategoryRes>

export const CategoryListRes = z.object({
    data: z.array(categorySchema),
    message: z.string()
})

export type CategoryListResType = z.TypeOf<typeof CategoryListRes>

export const CategoryParams = z.object({
    id: z.coerce.number()
})

export type CategoryParamsType = z.TypeOf<typeof CategoryParams>

export const CategoryListWithPaginationQuery = z.object({
    page: z.coerce.number().positive().lte(10000).default(1),
    limit: z.coerce.number().positive().lte(10000).default(10)
})

export type CategoryListWithPaginationQueryType = z.TypeOf<typeof CategoryListWithPaginationQuery>

export const CategoryListWithPaginationRes = z.object({
    data: z.object({
        totalItem: z.number(),
        totalPage: z.number(),
        page: z.number(),
        limit: z.number(),
        items: z.array(categorySchema)
    }),
    message: z.string()
})
export type CategoryListWithPaginationResType = z.TypeOf<typeof CategoryListWithPaginationRes>