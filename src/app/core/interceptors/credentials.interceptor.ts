import { HttpInterceptorFn } from "@angular/common/http";

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
    // Instructs HttpClient to include authentication cookies with every outbound req
    const secureReq = req.clone({
        withCredentials: true
    });
    return next(secureReq);
}