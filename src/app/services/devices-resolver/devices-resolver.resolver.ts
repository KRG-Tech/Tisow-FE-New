import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { DataFetcherService } from '../data-fetcher/data-fetcher.service';
import { catchError, of } from 'rxjs';

export const devicesResolverResolver: ResolveFn<boolean> = (route, state) => {
  const serverFetch = inject(DataFetcherService);
  let host_id = route.paramMap.get('id');
  return serverFetch.fetchServer({ id: host_id }, 'GetDevices').pipe(
    catchError((error: any) => {
      return of(error);
    })
  );
};
