# Manasatchi AI 🤖💙

> Your compassionate AI companion with personalized family voices for emotional support

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Sharumathi-p/ProjectKALAM)

## 🌟 Features

- **🎙️ Voice Assistant**: AI-powered voice conversations with emotional intelligence
- **👨‍👩‍👧‍👦 Family Voices**: Clone and use voices of loved ones for personalized support
- **💬 Smart Chat**: Context-aware conversations with memory
- **🌍 Multi-language**: Support for multiple languages with real-time translation
- **🎨 Beautiful UI**: Modern cyan-themed interface with smooth animations
- **🔒 Secure**: Built with Supabase authentication and RLS policies
- **📱 Responsive**: Works seamlessly on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Supabase account
- Groq API key (free tier available)
- ElevenLabs API key (optional, for voice cloning)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sharumathi-p/ProjectKALAM.git
   cd ProjectKALAM
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GROQ_API_KEY=your_groq_api_key
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

4. **Set up Supabase**:
   - Run migrations in `supabase/migrations/` folder
   - Configure authentication settings
   - Set up storage buckets

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   ```
   http://localhost:5173
   ```

## 📦 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **UI Components**: Material-UI (MUI)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq (LLaMA models)
- **Voice**: ElevenLabs + Web Speech API
- **Routing**: React Router v6
- **State Management**: Zustand + React Context

## 🏗️ Project Structure

```
ProjectKALAM/
├── src/
│   ├── components/       # React components
│   │   ├── auth/        # Login, Register
│   │   ├── chat/        # Chat interface
│   │   ├── dashboard/   # Main dashboard
│   │   ├── landing/     # Landing page sections
│   │   ├── profile/     # User profile & settings
│   │   └── voice/       # Voice recorder
│   ├── contexts/        # React contexts
│   ├── pages/           # Page components
│   ├── services/        # API services
│   │   ├── supabase.ts
│   │   ├── openai.ts
│   │   ├── elevenlabs.ts
│   │   ├── speech.ts
│   │   └── translation.ts
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── supabase/            # Database migrations
├── docs/                # Documentation
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies

```

## 🔧 Configuration

### Supabase Setup

1. Create tables using migrations in `supabase/migrations/`
2. Enable Row Level Security (RLS)
3. Configure authentication providers
4. Set up storage buckets for voice samples

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_GROQ_API_KEY` | Groq API key for AI | Yes |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs for voice cloning | Optional |
| `VITE_APP_NAME` | Application name | No |
| `VITE_ENABLE_VOICE_CLONING` | Enable voice cloning feature | No |

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub** (already done!)

2. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Update Supabase**:
   - Set Site URL to your Vercel domain
   - Add redirect URLs

See [VERCEL-DEPLOYMENT-STEPS.md](./VERCEL-DEPLOYMENT-STEPS.md) for detailed instructions.

### Deploy to Other Platforms

The app can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 📖 Documentation

- [Setup Guide](./docs/setup-guide.md)
- [Deployment Guide](./docs/deployment-guide.md)
- [Vercel Deployment Steps](./VERCEL-DEPLOYMENT-STEPS.md)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Groq** for fast AI inference
- **Supabase** for backend infrastructure
- **ElevenLabs** for voice cloning technology
- **Vercel** for hosting and deployment

## 📧 Contact

- **GitHub**: [@Sharumathi-p](https://github.com/Sharumathi-p)
- **Email**: poojamadhu2017@gmail.com

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Built with ❤️ for emotional well-being and connection**
