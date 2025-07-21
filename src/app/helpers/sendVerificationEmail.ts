import {resend} from '@/app/lib/resend';
import VerificationEmail from '../../../email/VerificationEmail';
import { ApiResponse  } from '@/app/types/ApiResponse'; 

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifycode: string
): Promise<ApiResponse>{
    try{

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'GhostMSG | Verification code',
            react: VerificationEmail({ username , otp: verifycode }),
        });

        return{
            success: false,
            message: 'Email send successfully'
        }
    }catch(emailError){
        console.log("Error sending verification email",emailError)
        return{
            success: false, 
            message: 'Failed to send verification email'
        }
    }
}