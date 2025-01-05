import UseHandleApi from '@/interfaces/use-handle-api.interface';
import { handleLogin, handleRegister } from '@/services/auth/auth.service';
import { useMutation } from '@tanstack/react-query';

export const useRegister = ({ onSuccess, onError }: UseHandleApi) =>
  useMutation({
    mutationFn: handleRegister,
    onSuccess: onSuccess,
    onError: onError,
  });

export const useLogin = ({ onSuccess, onError }: UseHandleApi) =>
  useMutation({
    mutationFn: handleLogin,
    onSuccess: onSuccess,
    onError: onError,
  });
