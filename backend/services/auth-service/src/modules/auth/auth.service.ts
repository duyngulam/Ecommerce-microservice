import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const userExists = await this.userRepository.findOne({ where: { email: dto.email } });
        if (userExists) throw new BadRequestException('Email đã được sử dụng');

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = this.userRepository.create({
            ...dto,
            password: hashedPassword,
        });
        await this.userRepository.save(user);

        return { message: 'Đăng ký tài khoản thành công' };
    }

    async login(dto: LoginDto) {
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
            select: ['id', 'email', 'password', 'username', 'role'],
        });

        if (!user) throw new UnauthorizedException('Thông tin đăng nhập không chính xác');

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Thông tin đăng nhập không chính xác');

        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
            },
        };
    }
}