export interface Order {
  id: number
  orderNo: string
  goodsId: number
  goodsTitle: string
  goodsPrice: number
  sellerId: number
  buyerId: number
  status: number
  createTime?: string
}
