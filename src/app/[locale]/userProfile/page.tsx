import React from 'react'
import UserHomePage from './Home/page'
import { redirect } from 'next/navigation';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';

async function UserProfilePage (){

        // Check authentication status
        const authResult = await  checkAuth();
        
        // The logic was inverted - if NOT successful, delete session and redirect
        if (!authResult.success) {
            redirect('/auth/sign-in');
        }

    return (
        <div className='w-full ' >
            <UserHomePage/>
            
        </div>
    )
}

export default UserProfilePage
