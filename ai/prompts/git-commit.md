Run git diff --cached to see what is staged, and git log --oneline -5 to see recent commit style. Write a concise commit message that:

    Starts with a verb (add, update, fix, refactor, remove)
    Focuses on why the change was made, not what files changed
    Keeps the subject line under 72 characters
    Adds a body only if the change needs explanation beyond the subject line

Output the commit message in chat for the user to run themselves. Do NOT run git commit.