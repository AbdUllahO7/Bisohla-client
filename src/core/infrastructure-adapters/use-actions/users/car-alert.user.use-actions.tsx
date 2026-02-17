'use client';

import { QueryParams } from '@/core/entities/api/api';
import {
    ApiResponse,
    PaginatedResponse,
} from '@/core/entities/api/success.response';
import { SelectCarAlertDto } from '@/core/entities/models/car-alerts/car-alerts.dto';
import {
    getCarAlerts,
    getCarAlertById,
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
    });
