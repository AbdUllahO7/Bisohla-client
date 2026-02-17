import { ICarAlertUserService } from '@/core/application/services/users/car-alert.user.service.interface';
import { QueryParams } from '@/core/entities/api/api';
import {
    ApiResponse,
    PaginatedResponse,
    SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectCarAlertDto } from '@/core/entities/models/car-alerts/car-alerts.dto';
import {
    CreateCarAlertDto,
    ToggleCarAlertStatusDto,
    UpdateCarAlertDto,
} from '@/core/entities/models/car-alerts/car-alerts.zod.dto';
import {
    deleteAuthReq,
    getAuthReq,
    postAuthReq,
    putAuthReq,
    patchAuthReq,
} from '@/core/lib/api';

export class CarAlertUserService implements ICarAlertUserService {
    async getCarAlerts(
        params: QueryParams,
    ): Promise<PaginatedResponse<SelectCarAlertDto>> {
        const res = await getAuthReq<Record<string, unknown>, SelectCarAlertDto>({
            url: '/car-alerts',
            params: params,
        });
        return res;
    }

    async getCarAlertById(id: number): Promise<ApiResponse<SelectCarAlertDto>> {
        const res = await getAuthReq<Record<string, unknown>, SelectCarAlertDto>({
            url: '/car-alerts/' + id,
        });
        return res;
    }

    async createCarAlert(
        dto: CreateCarAlertDto,
    ): Promise<ApiResponse<SelectCarAlertDto>> {
        const res = await postAuthReq<CreateCarAlertDto, SelectCarAlertDto>({
            url: '/car-alerts',
            body: dto,
        });
        return res;
    }

    async updateCarAlert(
        id: number,
        dto: UpdateCarAlertDto,
    ): Promise<ApiResponse<SelectCarAlertDto>> {
        const res = await putAuthReq<UpdateCarAlertDto, SelectCarAlertDto>({
            url: '/car-alerts/' + id,
            body: dto,
        });
        return res;
    }

    async deleteCarAlert(
        id: number,
    ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
        const res = await deleteAuthReq({
            url: '/car-alerts/' + id,
        });
        return res;
    }

    async toggleCarAlertStatus(
        id: number,
        dto: ToggleCarAlertStatusDto,
    ): Promise<ApiResponse<SelectCarAlertDto>> {
        const res = await patchAuthReq<ToggleCarAlertStatusDto, SelectCarAlertDto>({
            url: '/car-alerts/' + id + '/toggle-status',
            body: dto,
        });
        return res;
    }
}
