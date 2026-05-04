
"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

export default function SubmissionSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const submissionId = searchParams.get('id');

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <Logo />
                </div>
                <Card className="shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                    <CardContent className="p-10 lg:p-16 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Submission Successful!</h1>
                        <p className="mt-3 text-slate-500 max-w-prose mx-auto">
                            Thank you for completing your onboarding pack. Your information has been securely submitted, and a notification has been sent to our team.
                        </p>
                        <div className="mt-8 bg-slate-50/70 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500">
                            <strong>Submission ID:</strong> {submissionId || 'Not available'}
                        </div>
                        <div className="mt-10">
                            <Button 
                                size="lg"
                                className="rounded-full font-bold h-12 w-64 shadow-lg"
                                onClick={() => router.push('/dashboard')}
                            >
                                <LayoutDashboard className="w-5 h-5 mr-2" />
                                Return to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <p className="text-center text-xs text-slate-400 mt-8">
                    You can now close this window or return to your dashboard. Your submitted files are locked.
                </p>
            </div>
        </div>
    );
}
