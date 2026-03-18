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

export interface ICarAlertUserUseCase {
    getCarAlerts(
        params: QueryParams,
    ): Promise<PaginatedResponse<SelectCarAlertDto>>;
    getCarAlertById(id: number): Promise<ApiResponse<SelectCarAlertDto>>;
    createCarAlert(dto: CreateCarAlertDto): Promise<ApiResponse<SelectCarAlertDto>>;
    updateCarAlert(
        id: number,
        dto: UpdateCarAlertDto,
    ): Promise<ApiResponse<SelectCarAlertDto>>;
    deleteCarAlert(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>>;
    toggleCarAlertStatus(
        id: number,
        dto: ToggleCarAlertStatusDto,
    ): Promise<ApiResponse<SelectCarAlertDto>>;
}
