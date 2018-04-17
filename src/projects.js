const PROJECTS = [
  {
    repo: 'jquery/jquery',
    name: 'jQuery JavaScript Library',
    color: '#333',
    emoji: '😎'
  }
]

const getProjectByRepo = (repo) => {
  return PROJECTS.find(project => project.repo === repo)
}

module.exports = {
  PROJECTS,
  getProjectByRepo
}