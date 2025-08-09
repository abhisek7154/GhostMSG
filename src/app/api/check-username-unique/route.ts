import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/User";
import { z } from "zod"
import { usernameValidation } from "@/app/schemas/signUpSchema";


const UsernameQuarySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request){
    await dbConnect();

    try{

        const { searchParams } = new URL(request.url)
        const quaryParam = {
            username: searchParams.get('username')
        };

        // Validate with zod

       const result =  UsernameQuarySchema.safeParse(quaryParam)
       console.log(result) // TODO: Remove
       if (!result.success){
        const usernameErrors = result.error.format().username?._errors || [];
        return Response.json({
            success: false,
            message: usernameErrors?.length > 0
            ? usernameErrors.join(', ')
            : 'Invalid query parameters' ,
        } , {status: 400})
       }

       const {username} = result.data

       // Check username existence

       const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true})
        
       if(existingVerifiedUser){
        return Response.json({
            success: false,
            message: 'Username is already taken' ,
        } , {status: 409}) // 409 = Conflict
       }
       return Response.json({
            success: true,
            message: 'Username is unique' ,
        } , {status: 200})
    }catch (error){
        console.error("Error checking username", error)
        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            { status : 500}
        )
    }
}