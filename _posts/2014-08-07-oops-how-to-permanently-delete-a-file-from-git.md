---
layout: post
title: "Oops! How To Permanently Delete a File from Git"
date: 2014-08-07 08:00:00 -0400
comments: true
tags: git
---

> I accidentally added an uninitialized (appended) SQL Server backup file, a `*.bak`, to source control and pushed it. Now, no one can fetch a clean copy of the source because of out-of-memory errors. How do I fix this?

```
git filter-branch --tree-filter 'git rm -r -f --ignore-unmatch *.bak' HEAD
```

This will take a while to run, as it goes through every commit in your project and deletes the file. When you're done, you'll need to push the file to your remote.

```
git push origin master --force
```

You'll need the `--force` flag because this is not a fast-forward commit.

- [Permanently remove files and folders from a git repository](http://dalibornasevic.com/posts/2-permanently-remove-files-and-folders-from-a-git-repository)
- [Git filter-branch documentation](http://git-scm.com/docs/git-filter-branch)
