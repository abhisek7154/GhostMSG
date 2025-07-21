import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/User";
import bcrypt from "bcryptjs";
import {sendVerificationEmail} from "@/app/helpers/sendVerificationEmail";


export async function POST(request: Request){
    await dbConnect()

    try{

        const {username , email , password} =await request.json()

        const existingUserIsVerifiedByUserName = await UserModel.
        findOne({
            username,
            isVerified: true
        })

        if (existingUserIsVerifiedByUserName) {

            return Response.json({
                success: false,
                message: "username already taken"
            } , {status: 400})
            
        }

        const existingUserByEmail = await UserModel.
        findOne({email})

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(existingUserByEmail){

            if(existingUserByEmail.isVerified){

            return Response.json({
                success: false,
                message: `User aleready exists with this email`
            } , {status: 400}
        );

        } else {

            const hashedPassword = await bcrypt.hash(password, 10)
            existingUserByEmail.password = hashedPassword;
            existingUserByEmail.verifyCode = verifyCode;
            existingUserByEmail.verifyCodeExpiry = new
            Date(Date.now() + 3600000)
            await existingUserByEmail.save()
        }
        } else {
           const hashedPassword =  await bcrypt.hash(password , 10)
           const expiryDate = new Date()
           expiryDate.setHours(expiryDate.getHours() + 1)

           const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpire: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                message: []
           })

           await newUser.save()
        }

        //* Send Verification Email..

        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if (!emailResponse.success){
            return Response.json({
                success: false,
                message: `email response:${emailResponse.message}`
            } , {status: 500})
        }

        return Response.json({
                success: true,
                message: `email response:${emailResponse.message}`
            } , {status: 201})

    }catch(error){
        console.error('Error while sending the message' , error)
        return Response.json(
            {
                success: false,
                message: "Error registring user"
            },
            {
                status: 500
            }
        )
    }
}