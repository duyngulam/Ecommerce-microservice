import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'hathuanihi.tekno@gmail.com' })
    @IsEmail({}, { message: 'Email is invalid' })
    email: string;

    @ApiProperty({ example: 'Password@123' })
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}
