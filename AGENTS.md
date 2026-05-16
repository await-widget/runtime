# Project Notes

## Conventions

- Use regular sentence case for commits, not too long. Never use Conventional Commits formats.
- Write readable code over clever. Only comment when necessary.
- Agents should never added themselves as co-author in commit.

## Publishing

1. This project use the OIDC publishing workflow, the workflow file is located at `.github/workflows/publish.yml`.
2. Always ask for bumping `major`, `minor`, or `patch` version when before publishing, and introduce what the next version will be.
3. The publishing commit should be always version number change only, and commit message is in x.x.x format (without prefixed "v").
4. After committing, create a version tag vx.x.x (has prefixed "v") on the version change commit.
5. Push the version change commit, and push the tag to trigger the OIDC publishing workflow.
6. After the new runtime version is published, search the sibling `../skills` directory and update every skill that depends on `@await-widget/runtime` to use the newly published version.
