const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')

// Public Routes

blogsRouter.get('/', async (_, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { 'blogs': false })

  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog
    .findById(request.params.id)
    .populate('user', { 'blogs': false })
  if(!blog)
    return response.status(404).end()
  response.json(blog)
})

// Auth Routes

blogsRouter.use(middleware.authentication)

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findById(request.user.id)

  const blog = new Blog({
    ...body,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async(request, response) => {
  const blog = await Blog.findById(request.params.id)

  if(!blog)
    return response.status(404).end()

  if(request.user.id !== blog.user.toString())
    return response.status(403).json({ error: 'access denied' })

  await blog.remove()
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {

  const blog = await Blog.findById(request.params.id)

  if(!blog)
    return response.status(404).end()

  if(request.user.id !== blog.user)
    return response.status(403).json({ error: 'access denied' })

  const body = request.body

  const updatedBlog = await blog.update(body, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter