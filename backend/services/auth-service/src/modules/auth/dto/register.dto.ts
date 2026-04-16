import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'hathuanihi' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'hathuanihi.tekno@gmail.com' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @ApiProperty({ example: 'Password@123' })
    @MinLength(6, { message: 'Mật khẩu phải ít nhất 6 ký tự' })
    password: string;
}
