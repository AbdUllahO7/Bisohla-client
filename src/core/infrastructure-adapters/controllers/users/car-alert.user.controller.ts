import { ICarAlertUserController } from '@/core/application/controllers/users/car-alerts/car-alert-controller.interface';
import { ICarAlertUserUseCase } from '@/core/application/use-cases/users/car-alerts/car-alert.user.use-case.interface';
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
import { catchClientRequest } from '@/core/lib/error';

export class CarAlertUserController implements ICarAlertUserController {
    constructor(private readonly carAlertUserUseCase: ICarAlertUserUseCase) { }

    async getCarAlerts(
        params: QueryParams,
    ): Promise<PaginatedResponse<SelectCarAlertDto>> {
        try {
            return await this.carAlertUserUseCase.getCarAlerts(params);
        } catch (e) {
            return catchClientRequest(e);
        }
    }

    async getCarAlertById(id: number): Promise<ApiResponse<SelectCarAlertDto>> {
        try {
            return await this.carAlertUserUseCase.getCarAlertById(id);
        } catch (e) {
            return catchClientRequest(e);
        }
    }

    async createCarAlert(
        dto: CreateCarAlertDto,
    ): Promise<ApiResponse<SelectCarAlertDto>> {
        try {
            return await this.carAlertUserUseCase.createCarAlert(dto);
        } catch (e) {
            return catchClientRequest(e);
        }
    }

    async updateCarAlert(
        id: number,
        dto: UpdateCarAlertDto,
    ): Promise<ApiResponse<SelectCarAlertDto>> {
        try {
            return await this.carAlertUserUseCase.updateCarAlert(id, dto);
        } catch (e) {
            return catchClientRequest(e);
        }
    }

    async deleteCarAlert(
        id: number,
    ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
        try {
            return await this.carAlertUserUseCase.deleteCarAlert(id);
        } catch (e) {
            return catchClientRequest(e);
        }
    }

    async toggleCarAlertStatus(
        id: number,
        dto: ToggleCarAlertStatusDto,
    ): Promise<ApiResponse<SelectCarAlertDto>> {
        try {
            return await this.carAlertUserUseCase.toggleCarAlertStatus(id, dto);
        } catch (e) {
            return catchClientRequest(e);
        }
    }
}
