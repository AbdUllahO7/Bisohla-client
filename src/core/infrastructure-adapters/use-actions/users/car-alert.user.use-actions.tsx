'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryParams } from '@/core/entities/api/api';
import {
    ApiResponse,
    PaginatedResponse,
    SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectCarAlertDto } from '@/core/entities/models/car-alerts/car-alerts.dto';
import {
    CreateCarAlertDto,
    UpdateCarAlertDto,
    ToggleCarAlertStatusDto,
} from '@/core/entities/models/car-alerts/car-alerts.zod.dto';
import {
    getCarAlerts,
    getCarAlertById,
    createCarAlert,
    updateCarAlert,
    deleteCarAlert,
    toggleCarAlertStatus,
} from '../../actions/users/car-alert.user.actions';
import { useLocaleQuery } from '../common/use-locale-query';

export const useCarAlerts = (params: QueryParams) =>
    useLocaleQuery<PaginatedResponse<SelectCarAlertDto>>({
        queryKey: ['user-car-alerts', params],
        queryFn: async () => await getCarAlerts(params),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

export const useCarAlertById = (id: number) =>
    useLocaleQuery<ApiResponse<SelectCarAlertDto>>({
        queryKey: ['user-car-alert', id],
        queryFn: async () => await getCarAlertById(id),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!id,
    });

export const useCreateCarAlert = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<SelectCarAlertDto>, Error, CreateCarAlertDto>({
        mutationFn: async (dto) => await createCarAlert(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-car-alerts'] });
        },
    });
};

export const useUpdateCarAlert = () => {
    const queryClient = useQueryClient();

    return useMutation<
        ApiResponse<SelectCarAlertDto>,
        Error,
        { id: number; dto: UpdateCarAlertDto }
    >({
        mutationFn: async ({ id, dto }) => await updateCarAlert(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-car-alerts'] });
            queryClient.invalidateQueries({ queryKey: ['user-car-alert'] });
        },
    });
};

export const useDeleteCarAlert = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<SuccessResponseWithNoContent>, Error, number>({
        mutationFn: async (id) => await deleteCarAlert(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-car-alerts'] });
        },
    });
};

export const useToggleCarAlertStatus = () => {
    const queryClient = useQueryClient();

    return useMutation<
        ApiResponse<SelectCarAlertDto>,
        Error,
        { id: number; dto: ToggleCarAlertStatusDto }
    >({
        mutationFn: async ({ id, dto }) => await toggleCarAlertStatus(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-car-alerts'] });
        },
    });
};
