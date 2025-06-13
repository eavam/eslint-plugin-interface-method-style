# Contributing to eslint-plugin-interface-method-style

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/eslint-plugin-interface-method-style.git
   cd eslint-plugin-interface-method-style
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Run tests**
   ```bash
   yarn test
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Write code following the existing style
   - Add tests for new functionality
   - Update documentation if needed

3. **Run the development checks**
   ```bash
   yarn lint          # Check code style
   yarn type-check    # Check TypeScript types
   yarn test          # Run tests
   yarn test:coverage # Check test coverage
   yarn build         # Ensure it builds
   ```

### Code Style

- We use ESLint and Prettier for code formatting
- Follow TypeScript best practices
- Write clear, descriptive commit messages
- Add JSDoc comments for public APIs

### Testing

- Write tests for all new functionality
- Ensure test coverage remains above 80%
- Test both valid and invalid cases
- Include edge cases in your tests

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for test changes
- `refactor:` for code refactoring
- `chore:` for maintenance tasks

Example:

```
feat: add support for generic interfaces
fix: handle edge case with static methods
docs: update README with new examples
```

## Pull Request Process

1. **Ensure all checks pass**

   - All tests pass
   - Code coverage is maintained
   - No linting errors
   - TypeScript compiles without errors

2. **Update documentation**

   - Update README.md if needed
   - Add examples for new features
   - Update CHANGELOG.md

3. **Create a pull request**

   - Use a descriptive title
   - Explain what changes you made and why
   - Reference any related issues

4. **Respond to feedback**
   - Address review comments promptly
   - Make requested changes
   - Keep the PR up to date with main branch

## Release Process

Releases are automated through GitHub Actions when changes are merged to the main branch.

## Getting Help

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues before creating new ones

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's coding standards

Thank you for contributing! 🎉
