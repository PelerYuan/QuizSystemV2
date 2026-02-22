## 👨‍💻 Team Workflow & Git Conventions

To maintain code quality and project stability, **direct pushes to the `main` branch are strictly prohibited**. All team members must follow the development workflow below:

### 1. Claiming a Task
Go to the **Projects Board** on the GitHub repository, drag the task card you want to work on from `To Do` to `In Progress`, and assign it to yourself.

### 2. Branching Strategy
Always create a new branch from the latest `main` branch. The branch naming convention is as follows:
- New feature: `feat/your-feature-name` (e.g., `feat/teacher-login`)
- Bug fix: `fix/bug-name` (e.g., `fix/timer-reset`)
- Documentation: `docs/doc-name` (e.g., `docs/api-schema`)
- Miscellaneous chores: `chore/task-name` (e.g., `chore/update-dependencies`, `chore/add-license`)

```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

### 3. Commit Message Convention
Keep commit messages clear and concise. The prefix should match your branch type:
- `feat: add teacher login UI`
- `fix: resolve timer reset issue on page refresh`

### 4. Pull Requests (PR)
- Once your code is ready, push it to your remote branch.
- Open a Pull Request (PR) to the `main` branch on GitHub.
- Move your task card to the `In Review` column on the Projects board.
- **Wait for the Tech Lead or another team member to review your code. The PR can only be merged after receiving an Approval.**
