import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from   
 'rxjs';
 import { AuthenticationService } from 'src/app/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthenticationService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean   
 | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return new Promise(resolve => {
      this.authService.isLoggedIn().subscribe(isLoggedIn => {
        if (isLoggedIn) {
          resolve(true);
        } else {
          this.router.navigate(['/login']);
          resolve(false);
        }
      });
    });
  }
}