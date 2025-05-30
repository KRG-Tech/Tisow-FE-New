import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { devicesResolverResolver } from './devices-resolver.resolver';

describe('devicesResolverResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => devicesResolverResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
