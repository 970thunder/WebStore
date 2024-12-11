import request from '@/utils/request.js'
import { useTokenStore } from '@/stores/token.js'

export const goodCategoryListService = () => {
    const tokenStore = useTokenStore();
    return request.get('/category')
}

//添加分类
export const goodCategoryAddService = (categoryData) => {
    return request.post('/category', categoryData)
}

//更新分类
export const goodCategoryUpdateService = (categoryModel) => {
    return request.put('/category', categoryModel)
}

//删除商品分类
export const goodCategoryDeleteService = (id) => {
    return request.delete('/category?id=' + id)
}

//商品列表查询
export const goodListService = (params) => {
    return request.get('/products', { params: params })
}

//添加商品
export const goodAddService = (goodData) => {
    return request.post('/products', goodData)
}

//修改商品
export const goodUpdateService = (goodModel) => {
    return request.put('/products', goodModel)
}

//删除商品
export const goodDeleteService = (id) => {
    return request.delete('/products?id=' + id)
}