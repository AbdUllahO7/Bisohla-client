import { ICarAlertUserUseCase } from './car-alert.user.use-case.interface';
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

export class CarAlertUserUseCase implements ICarAlertUserUseCase {
    constructor(private readonly carAlertUserService: ICarAlertUserService) { }

    async getCarAlerts(
        params: QueryParams,
    ): Promise<PaginatedResponse<SelectCarAlertDto>> {
        return await this.carAlertUserService.getCarAlerts(params);
    }

    async getCarAlertById(id: number): Promise<ApiResponse<SelectCarAlertDto>> {
        return await this.carAlertUserService.getCarAlertById(id);
    }

    async createCarAlert(
        dto: CreateCarAlertDto,
    ): Promise<ApiResponse<SelectCarAlertDto>> {
        return await this.carAlertUserService.createCarAlert(dto);
    }

    async updateCarAlert(
        id: number,
        dto: UpdateCarAlertDto,
    ): Promise<ApiResponse<SelectCarAlertDto>> {
        return await this.carAlertUserService.updateCarAlert(id, dto);
    }

    async deleteCarAlert(
        id: number,
    ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
        return await this.carAlertUserService.deleteCarAlert(id);
    }

    async toggleCarAlertStatus(
        id: number,
        dto: ToggleCarAlertStatusDto,
    ): Promise<ApiResponse<SelectCarAlertDto>> {
        return await this.carAlertUserService.toggleCarAlertStatus(id, dto);
    }
}
