import { IProductGroupsRepo } from '@/core/application/repositories/products/product-groups.repo.interface';
import {
  CreateProductGroupDto,
  EditProductGroupDtoForPage,
  SelectProductGroupDto,
  UpdateProductGroupDto,
} from '@/core/entities/models/products/product-groups.dto';
import { BaseRepo } from '../base.repo';
import { ApiResponse } from '@/core/entities/api/success.response';
import { putAuthReq } from '@/core/lib/api';

export class ProductGroupsRepo
  extends BaseRepo<
    SelectProductGroupDto,
    CreateProductGroupDto,
    UpdateProductGroupDto
  >
  implements IProductGroupsRepo
{
  async editWholeProductGroup(
    id: number,
    dto: EditProductGroupDtoForPage,
  ): Promise<ApiResponse<EditProductGroupDtoForPage>> {
    const res = await putAuthReq({
      url: '/' + this.path + '/edit-whole-group/' + id,
      body: dto,
    });

    return res;
  }
}
