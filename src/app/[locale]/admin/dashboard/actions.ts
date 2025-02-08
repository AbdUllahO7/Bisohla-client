'use server';

import { checkRole } from '../../actions';

export const checkAdminRole = async () => checkRole('admin');
