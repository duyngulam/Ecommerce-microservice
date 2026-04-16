import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async register(dto: RegisterDto) {
    const exists = await this.userRepository.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email has already been registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      role: 'customer',
    });

    await this.userRepository.save(user);
    return { message: 'Account registered successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'username', 'password', 'role'],
    });

    if (!user) throw new UnauthorizedException('Invalid login credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid login credentials');

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refresh_token);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: { sub: string; email: string; role: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or has expired');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'email', 'username', 'role', 'refreshToken'],
    });

    if (!user?.refreshToken) {
      throw new UnauthorizedException('Refresh token is invalid or has expired');
    }

    const tokenMatch = await bcrypt.compare(dto.refreshToken, user.refreshToken);
    if (!tokenMatch) throw new UnauthorizedException('Refresh token is invalid or has expired');

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refresh_token);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, { refreshToken: null });
    return { message: 'Logout successful' };
  }

  private async generateTokens(user: Pick<User, 'id' | 'email' | 'role'>) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);
    return { access_token, refresh_token };
  }

  private async saveRefreshToken(userId: string, rawToken: string) {
    const hashed = await bcrypt.hash(rawToken, 10);
    await this.userRepository.update(userId, { refreshToken: hashed });
  }
}
