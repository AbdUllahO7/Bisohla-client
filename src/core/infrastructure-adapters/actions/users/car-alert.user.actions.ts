'use server';

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
import { getInjection } from '@/di/container';

export const getCarAlerts = async (
    params: QueryParams,
): Promise<PaginatedResponse<SelectCarAlertDto>> => {
    const controller = getInjection('ICarAlertUserController');
    return await controller.getCarAlerts(params);
};

export const getCarAlertById = async (
    id: number,
): Promise<ApiResponse<SelectCarAlertDto>> => {
    const controller = getInjection('ICarAlertUserController');
    return await controller.getCarAlertById(id);
};

export const createCarAlert = async (
    dto: CreateCarAlertDto,
): Promise<ApiResponse<SelectCarAlertDto>> => {
    const controller = getInjection('ICarAlertUserController');
    return await controller.createCarAlert(dto);
};

export const updateCarAlert = async (
    id: number,
    dto: UpdateCarAlertDto,
): Promise<ApiResponse<SelectCarAlertDto>> => {
    const controller = getInjection('ICarAlertUserController');
    return await controller.updateCarAlert(id, dto);
};

export const deleteCarAlert = async (
    id: number,
): Promise<ApiResponse<SuccessResponseWithNoContent>> => {
    const controller = getInjection('ICarAlertUserController');
    return await controller.deleteCarAlert(id);
};

export const toggleCarAlertStatus = async (
    id: number,
    dto: ToggleCarAlertStatusDto,
): Promise<ApiResponse<SelectCarAlertDto>> => {
    const controller = getInjection('ICarAlertUserController');
    return await controller.toggleCarAlertStatus(id, dto);
};
