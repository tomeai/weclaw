from github import Github

g = Github(login_or_token='', timeout=10)

repo = g.get_repo('TencentEdgeOne/edgeone-pages-mcp')

# 获取项目描述
print(repo.description)

# 获取项目头像（owner 的 avatar）
print(repo.owner.avatar_url)

# 获取 README 内容
readme = repo.get_readme()
print(readme.decoded_content.decode())  # decode bytes -> str
