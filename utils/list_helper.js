const _ = require('lodash')

const dummy = (blogs) => {
  blogs
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if(blogs.length > 0){
    const maxVotes = Math.max(...blogs.map(blog => blog.likes))
    const mostVoted = blogs.find(blog => blog.likes === maxVotes)
    const { title, author, likes } = mostVoted
    return { title, author, likes }
  }

  return {}
}

const mostBlogs = (blogs) => {
  if(blogs.length > 0){
    const [author, totalBlogs] = _(blogs)
      .countBy(blog => blog.author)
      .entries()
      .maxBy(([, totalBlogs]) => totalBlogs)
    return { author, blogs: totalBlogs }
  }
  return {}
}

const mostLikes = (blogs) => {
  if(blogs.length > 0) {
    const [author, likes] = _(blogs)
      .groupBy(blog => blog.author)
      .entries()
      .map(([author, blogs]) => {
        const totalLikes = blogs.reduce((acum, blog) => {
          return acum + blog.likes
        }, 0)
        return [author, totalLikes]
      })
      .maxBy(([, likes]) => likes)
    return { author, likes }
  }
  return {}
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}