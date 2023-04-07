const { promises: fs } = require('fs')
const path = require('path')
const RSS = require('rss')
const matter = require('gray-matter')

async function generate() {
  const feed = new RSS({
    title: 'Hyunjo Lee',
    site_url: 'https://hyunjo.vercel.app/',
    feed_url: 'https://hyunjo.vercel.app/feed.xml'
  })

  const projects = await fs.readdir(path.join(__dirname, '..', 'pages', 'projects'))
  const allProjects = []
  await Promise.all(
    projects.map(async (name) => {
      if (name.startsWith('index.')) return

      const content = await fs.readFile(
        path.join(__dirname, '..', 'pages', 'projects', name)
      )
      const frontmatter = matter(content)

      allProjects.push({
        title: frontmatter.data.title,
        url: '/projects/' + name.replace(/\.mdx?/, ''),
        date: frontmatter.data.date,
        description: frontmatter.data.description,
        categories: frontmatter.data.tag.split(', '),
        author: frontmatter.data.author
      })
    })
  )

  allProjects.sort((a, b) => new Date(b.date) - new Date(a.date))
  allProjects.forEach((post) => {
      feed.item(post)
  })
  await fs.writeFile('./public/feed.xml', feed.xml({ indent: true }))
}

generate()
