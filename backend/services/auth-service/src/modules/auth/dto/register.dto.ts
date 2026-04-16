import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'hathuanihi' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'hathuanihi.tekno@gmail.com' })
    @IsEmail({}, { message: 'Email is invalid' })
    email: string;

    @ApiProperty({ example: 'Password@123' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}
