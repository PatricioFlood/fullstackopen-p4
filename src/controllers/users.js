const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (_, response) => {
  const users = await User
    .find({})
    .populate('blogs', { 'userId': false })

  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  if(!body.password)
    return response.status(400).json({ error: 'password is required' })

  if(body.password.length < 3)
    return response.status(400).json({ error: 'password must have at least 3 characters' })

  const saltRounds = 10

  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
    blogs: []
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

module.exports = usersRouter