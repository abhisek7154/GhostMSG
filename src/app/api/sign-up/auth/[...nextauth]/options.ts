import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/User";


export const authOptions: NextAuthOptions ={
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials:{
                email: {label: "username", type: "text" },
                password: {label: "password", type: "password"}
            },
            async authorize(credentials: any): Promise<any>{
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                         $or: [
                            {email: credentials.identifier},
                            {username: credentials.identifier}
                        ]
                });
                    if(!user){
                        throw new Error ("No user found with this email or username")
                    }
                    if (!user.isVerified){
                        throw new Error("User is not verified. Please check your email for verification link.") 
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password , user.password)

                    if(isPasswordCorrect){
                        return user
                    }else{
                        throw new Error('Incorrect password')
                    }

                }catch(err: any){
                    throw new Error(err)
                }
            }
        })
    ],

    callbacks:{
        async session({ session ,token }){
            if(token){
                session.user._id = token._id?.toString();
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session
    },
        async jwt({ token, user }) {
            if(user){
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token
        }
  },

    pages: {
        signIn: '/sign-in'
    },
    session:{
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
}