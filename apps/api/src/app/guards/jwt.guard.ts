import { AuthGuard } from '@nestjs/passport';

export class JWTAuthQuard extends AuthGuard('jwt') {}
