const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Blog = require('../models/blog')
const User = require('../models/user')
let token = ''

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }

  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = await new User({ username: 'root', passwordHash }).save()
  const userForToken = {
    username: user.username,
    id: user._id,
  }
  token = jwt.sign(userForToken, process.env.SECRET)
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('property id', async () => {
    const response = await api.get('/api/blogs')
    response.body.map(blog => expect(blog.id).toBeDefined())
  })
})

describe('addition of a new blog', () => {
  test('a blog can be added ', async () => {
    const newBlog = {
      title: 'Nuevo',
      author: 'Patricio Flood',
      url: 'http://localhost',
      likes: 15
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain(
      'Nuevo'
    )
  })

  test('if the likes property is missing, it will have the value 0', async () => {
    const newBlog = {
      title: 'Nuevo',
      author: 'Patricio Flood',
      url: 'http://localhost',
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)

    expect(response.body.likes).toBe(0)
  })

  test('if the title or url property is missing, server response with 400 Bad Request', async () => {
    const newBlog = {
      author: 'Patricio Flood',
      url: 'http://localhost',
    }
    const newBlog2 = {
      title: 'Nuevo',
      author: 'Patricio Flood'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    await api
      .post('/api/blogs')
      .send(newBlog2)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

afterAll(() => {
  mongoose.connection.close()
})