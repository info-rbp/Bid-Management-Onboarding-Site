
import React, { Suspense } from 'react';
import SubmissionSuccess from './SubmissionSuccess';

export default function SubmissionSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SubmissionSuccess />
        </Suspense>
    );
}
