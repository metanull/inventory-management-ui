# Contributing: Authenticating for Private GitHub Packages

This project depends on private npm packages hosted on GitHub Packages. You must authenticate with your own GitHub Personal Access Token (PAT) to install dependencies.

## Project `.npmrc`
The project-level `.npmrc` contains only:

```
@metanull:registry=https://npm.pkg.github.com/
```

This is safe to commit and does **not** contain any tokens.

## How to Authenticate
1. Generate a GitHub PAT with `read:packages` and `repo` scopes.
2. Add your token to your user-level npm config by running:
   ```powershell
   npm config set //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
   ```
   This writes the token to your user `.npmrc` (e.g., `C:\Users\<username>\.npmrc`).

3. You can now run `npm install` and access private packages.

## CI/CD
- In CI, set the token as an environment variable (e.g., `NPM_TOKEN`) and inject it at build time.
- Never store tokens in the repository.

## Security Reminder
- **Never commit your token to the repository.**
- Each contributor must use their own token.

Return to [README.md](README.md).
