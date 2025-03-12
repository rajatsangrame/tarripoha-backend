export class PagingResponse<T> {
  total: number;
  pageNo: number;
  pageSize: number;
  data: T[];

  constructor(total: number, pageNo: number, pageSize: number, data: T[]) {
    this.total = total;
    this.pageNo = pageNo;
    this.pageSize = pageSize;
    this.data = data;
  }
}
