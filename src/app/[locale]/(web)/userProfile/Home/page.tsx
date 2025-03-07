import { SidebarInset } from '@/components/ui/sidebar'
import React from 'react'


const UserHomePage = () => {



    return (
        <div className="flex h-full w-full flex-col mt-10">
            {/* Main Content */}
            <SidebarInset>
                <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8">
                    <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
                    <p className="text-muted-foreground">This is your main content area. Add your page content here.</p>
                    </div>

                    {/* Example content placeholder */}
                    <div className="grid gap-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Page Content</h2>
                        <p>
                        This is a simple placeholder for your main page content. You can replace this with your actual
                        content.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h3 className="mb-2 text-lg font-medium">Section One</h3>
                        <p>Add your content for section one here.</p>
                        </div>
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h3 className="mb-2 text-lg font-medium">Section Two</h3>
                        <p>Add your content for section two here.</p>
                        </div>
                    </div>
                    </div>
                </div>
                </main>
            </SidebarInset>
        </div>
    )
}

export default UserHomePage
