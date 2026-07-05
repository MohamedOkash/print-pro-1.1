# Contributing to Print Pro

We love contributions! Here is a simple guide to help you get started with contributing to **Print Pro**.

## Code of Conduct

Please be respectful and helpful. We aim to foster an open and welcoming community.

## How to Contribute

### 1. Report Bugs or Request Features
* Search existing [Issues](https://github.com/MohamedOkash/print-pro-1.1/issues) first to see if your topic is already discussed.
* Open a new Issue using the templates provided. Explain clearly the steps to reproduce the bug or the reasoning behind the feature request.

### 2. Code Contributions
1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/my-amazing-feature
   ```
3. Implement your changes. Ensure code is written in TypeScript and adheres to the project's styling.
4. Lint and verify the code compiles:
   ```bash
   npm run lint
   npm run build
   ```
5. Commit your changes with descriptive commit messages following Conventional Commits (e.g. `feat: add PDF merge tool`, `fix: scanner export resolution`).
6. Push to your branch and open a Pull Request (PR) against the `main` branch.

## Coding Guidelines
* Keep components reusable and modular under [components/](file:///home/tarek/printpro/app/components).
* Use the class utility helper `cn` from [lib/utils.ts](file:///home/tarek/printpro/app/lib/utils.ts) for dynamic Tailwind classes.
* Always verify the build passes without TypeScript or ESLint errors before submitting your PR.
* Write docstrings or clear comments for sophisticated logic (like rendering curves or fabric manipulation).

Thank you for contributing!
