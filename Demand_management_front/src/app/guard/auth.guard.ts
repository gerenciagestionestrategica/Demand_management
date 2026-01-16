import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  
  const auth = inject(AuthService);
  const router = inject(Router);

  auth.setRedirectUrl(state.url);

  
  await auth.waitForSessionCheck();

 
  if (auth.isLoading()) {
    return router.createUrlTree(['/loading']);
  }


  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  
  const expectedRoles: string[] = route.data['roles'] || [];
  if (expectedRoles.length && !auth.hasAnyRole(expectedRoles)) {
    return router.createUrlTree(['/home']);
  }

  return true;
};
