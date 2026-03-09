export type LoginStep = 'INITIAL' | 'EMAIL' | 'PASSWORD' | 'LOADING' | 'ERROR' | 'OAUTH_REDIRECT';

export function isLoginFlowStep(step: LoginStep) {
  return step !== 'INITIAL';
}

export function canSubmitPassword(step: LoginStep) {
  return step === 'PASSWORD' || step === 'ERROR';
}

export function isTerminalLoginStep(step: LoginStep) {
  return step === 'LOADING' || step === 'ERROR' || step === 'OAUTH_REDIRECT';
}
