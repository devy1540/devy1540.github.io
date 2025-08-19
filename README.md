# My Blog

A modern personal blog built with React, TypeScript, and GitHub Pages.

## 🚀 Features

- **Modern Tech Stack**: React 18+ with TypeScript and Vite
- **Beautiful UI**: Shadcn UI components with dark/light mode
- **Markdown Support**: Full markdown rendering with syntax highlighting
- **Responsive Design**: Mobile-first design that works on all devices
- **Accessibility**: WCAG AA compliant with keyboard navigation
- **SEO Friendly**: Optimized meta tags and semantic HTML
- **GitHub Pages**: Automatic deployment via GitHub Actions

## 🛠️ Tech Stack

- **Frontend**: React 18.3+, TypeScript 5.3+
- **Build Tool**: Vite 5.0+
- **UI Library**: Shadcn UI + TailwindCSS 3.4+
- **State Management**: Zustand 4.5+
- **Routing**: React Router 6.20+
- **Markdown**: react-markdown 9.0+ with Prism.js syntax highlighting
- **Testing**: Vitest + React Testing Library
- **Deployment**: GitHub Pages + GitHub Actions

## 🚦 Quick Start

### Prerequisites

- Node.js 22.0.0 or higher
- npm 10.0.0 or higher

### Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/[username]/devy1540.git
   cd devy1540
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📖 Content Management

### Adding New Posts

1. Create a new markdown file in `content/posts/`:
   ```markdown
   ---
   title: "Your Post Title"
   slug: "your-post-slug"
   isDraft: false
   createdAt: "2024-12-20T09:00:00Z"
   updatedAt: "2024-12-20T09:00:00Z"
   publishedAt: "2024-12-20T10:00:00Z"
   category: "Tutorial"
   tags: ["react", "typescript"]
   excerpt: "Brief description of your post"
   ---

   # Your Post Content

   Write your post content here using Markdown syntax.
   ```

2. The post will automatically appear in the blog after deployment.

## 🚀 Deployment

### Automatic Deployment

This blog automatically deploys to GitHub Pages when you push to the `main` branch.

### Manual Deployment Setup

1. **Enable GitHub Pages**
   - Go to your repository Settings
   - Navigate to Pages section
   - Set Source to "GitHub Actions"

2. **First Deployment**
   ```bash
   git add .
   git commit -m "feat: initial blog setup"
   git push origin main
   ```

3. **Access your blog**
   Your blog will be available at: `https://[username].github.io/devy1540/`

### Custom Domain (Optional)

1. Add a `CNAME` file to the `public/` directory:
   ```
   yourdomain.com
   ```

2. Configure your domain's DNS settings:
   - Add a CNAME record pointing to `[username].github.io`

3. Update the base path in `vite.config.ts`:
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/' : '/',
   ```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

### Test Structure

- **Unit Tests**: Individual component and utility testing
- **Integration Tests**: User interaction and routing testing
- **Accessibility Tests**: WCAG compliance validation

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# Optional: GitHub Personal Access Token for future GitHub API integration
VITE_GITHUB_TOKEN=your_github_token_here

# Optional: Analytics
VITE_ENABLE_ANALYTICS=false
```

### Customization

- **Colors**: Modify CSS variables in `src/index.css`
- **Fonts**: Update font imports in `src/index.css`
- **Components**: Customize Shadcn UI components in `src/components/ui/`
- **Theme**: Extend theme configuration in `src/stores/useThemeStore.ts`

## 📁 Project Structure

```
devy1540/
├── .github/
│   └── workflows/
│       └── deploy.yaml          # GitHub Actions deployment
├── public/
│   ├── 404.html                 # SPA fallback for GitHub Pages
│   └── vite.svg                 # Favicon
├── src/
│   ├── components/
│   │   ├── ui/                  # Shadcn UI components
│   │   ├── layout/              # Layout components
│   │   ├── post/                # Post-related components
│   │   └── common/              # Common components
│   ├── pages/                   # Page components
│   ├── services/                # API services
│   ├── stores/                  # Zustand stores
│   ├── utils/                   # Utility functions
│   └── types/                   # TypeScript types
├── content/
│   └── posts/                   # Markdown blog posts
├── e2e/                         # End-to-end tests
└── docs/                        # Documentation
    ├── architecture.md
    ├── prd.md
    └── stories/                 # Development stories
```

## 🐛 Troubleshooting

### Common Issues

**Build fails with "Buffer is not defined"**
- This is already fixed with Buffer polyfill in `src/main.tsx`

**SPA routing doesn't work on GitHub Pages**
- Ensure `public/404.html` exists and matches the main index.html
- Check that `base` path is correctly set in `vite.config.ts`

**Styles not loading properly**
- Verify all asset paths are relative or use the correct base path
- Check TailwindCSS configuration in `postcss.config.js`

### Getting Help

1. Check existing issues in the repository
2. Review the documentation in `docs/` folder
3. Test locally first with `npm run preview` after building

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

---

Built with ❤️ using React, TypeScript, and GitHub Pages.