"use client"

import { PersonalForm } from "@/components/ui/personal-form"

export default function PersonalPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Personal Information</h1>
            <PersonalForm />
        </div>
    )
}
