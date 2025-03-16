import { ApiResponse } from '@/core/entities/api/success.response';
import { IBaseRepo } from '../../strategies/repo.strategy';
import {
  CreateProductGroupDto,
  EditProductGroupDtoForPage,
  SelectProductGroupDto,
  UpdateProductGroupDto,
} from '@/core/entities/models/products/product-groups.dto';

export interface IProductGroupsRepo
  extends IBaseRepo<
    SelectProductGroupDto,
    CreateProductGroupDto,
    UpdateProductGroupDto
  > {
  editWholeProductGroup(
    id: number,
    dto: EditProductGroupDtoForPage,
  ): Promise<ApiResponse<EditProductGroupDtoForPage>>;
}
