import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @MinLength(6, { message: 'Mật khẩu phải ít nhất 6 ký tự' })
    password: string;

    @IsEnum(['customer', 'admin'], { message: 'Role không hợp lệ' })
    role: string;
}