import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLE_KEYS } from 'src/common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEYS, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requireRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requireRoles.some((role) => user.role === role);
  }
}
