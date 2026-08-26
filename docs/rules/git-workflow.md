# Git workflow

## Commit and push (default)

On **feature / plan / fix** branches: **commit and push** without waiting to be asked.

## Never `main` / `master`

Do **not** commit, merge, or push to local or origin `main` / `master`.

PRs may **target** `main` as the merge base — that is not a push onto main.

Guard before every commit and push:

```bash
branch=$(git branch --show-current)
if [ "$branch" = main ] || [ "$branch" = master ]; then
  echo "refusing git write on $branch"
  exit 1
fi
```

## Also never

- Force-push unless the user explicitly asks
- Open a second PR for the same branch / topic
- Mix unrelated WIP into a commit

## Message

`<branch-name>: 1. <change> 2. …`
