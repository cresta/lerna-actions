# Lerna Actions

This is a library to handle intricacy of lerna publish process with github. The main issue is
Lerna is considering all git operation in the release process as "lerna version" call, and
considering all npm operations in the release process as "lerna publish" call. However, when we
perform release on github with a protected main branch, we will need to
1. commit and push to a pull request
2. tag git and publish to npm

Lerna is not able to move tagging to step 2 easily, and consider perform push and tagging to be
all or none in step 1. We opt to create our own lerna-create-release and lerna-publish-release
to address the issue.

Tagging and publishing is guaranteed to be all or none, and use at your own risk.