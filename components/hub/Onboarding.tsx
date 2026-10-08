'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import OnboardingDialog from '@/components/hub/OnboardingDialog';
import {
  clearOnboardingResumeStep,
  isOnboardingDone,
  markOnboardingDone,
  onboardingRequest,
  readOnboardingResumeStep,
  tourAllowedOn,
} from '@/lib/utils/onboarding';

// Decides when the tour is on screen: the first visit (on the hub and the
// two mode pages), a resume after a language switch reloaded the page, or
// a request from the settings modal. The dialog itself owns the steps
export default function Onboarding() {
  const pathname = usePathname();
  const requested = useSyncExternalStore(
    onboardingRequest.subscribe,
    onboardingRequest.isRequested,
    onboardingRequest.getServerSnapshot,
  );
  const [resumeStep] = useState(readOnboardingResumeStep);
  const [autoStep, setAutoStep] = useState<number | null>(
    () => resumeStep ?? (isOnboardingDone() ? null : 0),
  );

  useEffect(() => {
    clearOnboardingResumeStep();
  }, []);

  const autoOpen =
    autoStep !== null && (resumeStep !== null || tourAllowedOn(pathname));
  if (!requested && !autoOpen) return null;

  const finish = () => {
    markOnboardingDone();
    setAutoStep(null);
    onboardingRequest.clear();
  };

  return (
    <OnboardingDialog
      key={requested ? 'requested' : 'auto'}
      initialStep={requested ? 0 : (autoStep ?? 0)}
      onDone={finish}
    />
  );
}
