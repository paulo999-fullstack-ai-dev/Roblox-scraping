# Contributing to Roblox Scraping Platform

Thank you for your interest in contributing to our Roblox Game Analytics & Discovery Platform! This document provides guidelines and information for contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** for your changes
4. **Make your changes** following the coding standards
5. **Test your changes** thoroughly
6. **Submit a pull request**

## Development Setup

### Backend (Python/FastAPI)
```bash
cd backend
pip install -r requirements.txt
python setup_database.py
python create_indexes.py
uvicorn main:app --reload
```

### Frontend (React/TypeScript)
```bash
cd frontend
npm install
npm run dev
```

## Coding Standards

### Python (Backend)
- Follow PEP 8 style guidelines
- Use type hints where possible
- Write docstrings for all functions
- Keep functions focused and small
- Use meaningful variable names

### TypeScript/React (Frontend)
- Use TypeScript strict mode
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Use Tailwind CSS for styling

## Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
npm run lint
```

## Database Changes

If you're making database schema changes:

1. **Update models.py** with new fields/tables
2. **Create a migration script** in `backend/migrations/`
3. **Update setup_database.py** if needed
4. **Test the migration** on a copy of production data
5. **Document the changes** in the README

## API Changes

When modifying API endpoints:

1. **Update the router** in the appropriate file
2. **Update schemas.py** if request/response models change
3. **Update the frontend API calls** if needed
4. **Test the API** using the FastAPI docs at `/docs`
5. **Update API documentation** in the README

## Pull Request Process

1. **Ensure your code follows** the project's coding standards
2. **Include tests** for new functionality
3. **Update documentation** as needed
4. **Provide a clear description** of your changes
5. **Reference any related issues** in your PR description

## Code Review

All contributions require review before merging:

- **At least one approval** is required
- **Address all review comments** before merging
- **Ensure CI/CD checks pass** (tests, linting, security scans)

## Reporting Issues

When reporting bugs or requesting features:

1. **Use the issue templates** provided
2. **Provide detailed information** about the problem
3. **Include steps to reproduce** if it's a bug
4. **Add screenshots or logs** when relevant

## Getting Help

If you need help with your contribution:

- **Check existing issues** for similar problems
- **Ask questions** in the issue comments
- **Join discussions** in pull requests
- **Review the documentation** in the README and docs folder

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing! 🚀 