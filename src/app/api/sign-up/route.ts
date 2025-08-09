import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/app/helpers/sendVerificationEmail";
import { NextResponse } from "next/server";
import { success } from "zod";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    // Check if username is already taken by a verified user
    const existingUserIsVerifiedByUserName = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserIsVerifiedByUserName) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already taken",
        },
        { status: 400 }
      );
    }

    // Check if email exists
    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: `User already exists with this email`,
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpire = new Date(Date.now() + 3600000); // 1 hour
        await existingUserByEmail.save();

        const emailResponse = await sendVerificationEmail(email , username , verifyCode);
        if (!emailResponse.success){
          return NextResponse.json({
            success: false,
            message: emailResponse.message,
          }, {status: 500});
        }

        return NextResponse.json(
          {
          success: true,
          message: "Verification email resent.",
          },
          { status: 200 }
         );
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpire: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        message: [],
      });

      await newUser.save();
    }

    // Send Verification Email
    const emailResponse = await sendVerificationEmail(email, username, verifyCode);

    if (!emailResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Email response: ${emailResponse.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. Please check your email for verification code.",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in registering user: ", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}