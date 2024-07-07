import bcrypt from "bcrypt"
import prisma from "../lib/prisma.js"
import jwt from "jsonwebtoken"

export const register = async (req, res) => {
  const { username, email, password } = req.body

  try {
    // hash the password using bcrypt
    const hashPassword = await bcrypt.hash(password, 10)

    //   console.log(hashPassword)

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashPassword,
      },
    })

    //   console.log(newUser)
    res.status(201).json({ message: "new user created" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Failed to create user!" })
  }
}

export const login = async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" })
    }

    const isPasswordCorrect = bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid username or password" })
    }

    // Generate cookie and pass it to user
    // res.setHeader("Set-Cookie", "test=" + "myValue").json("success")

    const age = 1000 * 60 * 60 * 24 * 7

    const token = jwt.sign(
      {
        id: user.id,
        // isAdmin: true,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    )

    const { password: userPassword, ...userInfo } = user

    res
      .cookie("token", token, {
        httpOnly: true,
        // secure: true
      })
      .status(201)
      .json(userInfo)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "login Failed!" })
  }
}
export const logout = async (req, res) => {
  res.clearCookie("token").status(200).json({ message: "logout succesful " })
}
