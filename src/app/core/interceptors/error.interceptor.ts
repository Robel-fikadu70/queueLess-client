import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            //safety parse
            const detail = err.error?.detail ?? 'A system error occurred.';

            if(err.status === 401){
                router.navigate(['/login']);
            } else{
                console.log('API Error Payload: ', detail);
            }

            return throwError(() => err);
        })
    )
}