const router = require('express').Router()

const blogsRouter = require('../controllers/blogs')
const usersRouter = require('../controllers/users')
const loginRouter = require('../controllers/login')

router.use('/api/blogs', blogsRouter)
router.use('/api/users', usersRouter)
router.use('/api/login', loginRouter)

module.exports = router