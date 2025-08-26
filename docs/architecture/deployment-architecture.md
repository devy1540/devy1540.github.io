# Deployment Architecture

## Deployment Strategy

**Frontend Deployment:**
- **Platform:** GitHub Pages
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **CDN/Edge:** GitHub Pages CDN (Fastly)

**Backend Deployment:**
- **Platform:** N/A (GitHub API 활용)
- **Build Command:** N/A
- **Deployment Method:** 정적 파일 직접 커밋

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

## Environments

| Environment | Frontend URL | Backend URL | Purpose |
|------------|--------------|-------------|---------|
| Development | http://localhost:5173 | https://api.github.com | 로컬 개발 |
| Staging | https://YOUR_USERNAME.github.io/github-blog-staging | https://api.github.com | 테스트 배포 |
| Production | https://YOUR_USERNAME.github.io/github-blog | https://api.github.com | 실제 운영 |
