# ThreadSpire - Community Wisdom Threads

ThreadSpire is a platform where users post reflective or helpful threads — not tweets or rants, but wisdom drops. Others can react, bookmark, or remix them into their own collections. It's social knowledge, not social media.

## Features

### 💭 Wisdom Threads

- Create long-form structured threads with multiple segments
- Add rich text formatting with TipTap editor
- Add tags to categorize your wisdom
- Save drafts or publish when ready

### 👍 Reactions & Engagement

- React to individual thread segments with 5 different emojis (🤯, 💡, 😌, 🔥, 🫶)
- Bookmark threads to revisit later
- Share threads with others

### 🧠 Collections & Organization

- Create personal collections of wisdom threads
- Add/remove bookmarked threads to collections
- Public or private collection visibility

### 🔄 Remixing & Forking

- Fork interesting threads to create your own version
- Credit is given to the original thread author
- Customize and expand on others' wisdom

### 📊 Analytics Dashboard

- Track engagement with your threads
- See which segments resonate most with readers
- Monitor bookmarks, reactions, and forks over time

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Sequelize ORM with SQL Server
- **Authentication**: Clerk Authentication
- **UI**: Custom components with dark mode support

## Getting Started

### Prerequisites

- Node.js 20+
- SQL Server database
- Clerk account for authentication

### Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_database_connection_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/threadspire.git
cd threadspire
```

2. Install dependencies:

```bash
npm install
```

3. Initialize the database:

```bash
npm run db:init
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Vercel

This project is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy!

### Important Deployment Notes

- Ensure your SQL Server database is accessible from Vercel's servers
- Configure Clerk to use the production domain for redirects
- Set `NEXT_PUBLIC_APP_URL` to your production URL

## Project Structure

- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - React components
- `/models` - Sequelize database models
- `/lib` - Utility functions and configuration

## License

[MIT](https://choosealicense.com/licenses/mit/)
