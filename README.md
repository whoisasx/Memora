# Memora 🧠

**Your second brain: tag, connect, visualize, and chat with your knowledge.**

![Memora Hero](web/public/hero-dark.png)

Memora is an intelligent knowledge management system that helps you think better by organizing, connecting, and visualizing your ideas. With AI-powered search and beautiful graph visualizations, Memora transforms how you capture and interact with your knowledge.

## ✨ Features

### 🔗 **Smart Content Management**

-   **URL Parsing**: Automatically extract titles, descriptions, and metadata from web links
-   **Intelligent Tagging**: Organize content with customizable tags and suggestions
-   **Rich Metadata**: Store domain info, favicons, and descriptions for better organization

### 🧠 **AI-Powered Intelligence**

-   **Semantic Search**: Find content using natural language queries with vector embeddings
-   **Smart Connections**: Discover hidden relationships between your saved content
-   **Contextual Insights**: AI-assisted knowledge discovery and recommendation

### 📊 **Visual Knowledge Graphs**

-   **Interactive Node Visualization**: See your knowledge as an interconnected web
-   **Dynamic Relationships**: Visualize parent-child content relationships
-   **Graph Navigation**: Explore your knowledge space visually with D3.js

### 🎨 **Beautiful User Experience**

-   **Modern UI**: Clean, responsive interface with dark/light mode support
-   **Smooth Animations**: Fluid interactions powered by Motion library
-   **Intuitive Design**: Focus on content creation and discovery

### 🔍 **Advanced Search**

-   **Multi-Modal Search**: Text-based and vector similarity search
-   **Real-time Results**: Instant search with debounced queries
-   **Smart Filtering**: Filter by tags, favorites, recent items, and more

## 🏗️ Architecture

Memora follows a modern full-stack architecture:

### **Frontend** (`/web`)

-   **React 19** with TypeScript for type-safe development
-   **Vite** for lightning-fast development and building
-   **Tailwind CSS** for responsive, utility-first styling
-   **Motion** for smooth animations and micro-interactions
-   **Zustand** for lightweight state management
-   **React Router** for client-side routing

### **Backend** (`/server`)

-   **FastAPI** for high-performance Python API
-   **PostgreSQL** for relational data storage
-   **Elasticsearch** for full-text and vector search
-   **SQLAlchemy** for ORM and database migrations
-   **JWT Authentication** for secure user sessions

### **Infrastructure** (`/elastic-start-local`)

-   **Docker Compose** for local Elasticsearch setup
-   **Automated Scripts** for easy development environment setup

## 🚀 Quick Start

### Prerequisites

-   **Node.js** 18+ and **Bun** (for frontend)
-   **Python** 3.8+ (for backend)
-   **Docker** & **Docker Compose** (for Elasticsearch)
-   **PostgreSQL** database

### 1. Clone the Repository

```bash
git clone https://github.com/whoisasx/Memora.git
cd memora
```

### 2. Start Elasticsearch

```bash
cd elastic-start-local
chmod +x start.sh
./start.sh
```

### 3. Setup Backend

```bash
cd server

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://username:password@localhost/memora"
export JWT_SECRET_KEY="your-secret-key"
export ELASTICSEARCH_URL="http://localhost:9200"

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Setup Frontend

```bash
cd web

# Install dependencies
bun install

# Set environment variables
echo "VITE_BACKEND_URL=http://localhost:8000" > .env

# Start development server
bun run dev
```

### 5. Access the Application

-   **Frontend**: http://localhost:5173
-   **Backend API**: http://localhost:8000
-   **API Documentation**: http://localhost:8000/docs

## 📝 Environment Variables

### Backend (`.env` in `/server`)

```env
DATABASE_URL=postgresql://username:password@localhost/memora
JWT_SECRET_KEY=your-super-secret-jwt-key
ELASTICSEARCH_URL=http://localhost:9200
DOMAIN_NAME=localhost
```

### Frontend (`.env` in `/web`)

```env
VITE_BACKEND_URL=http://localhost:8000
```

## 🛠️ Development

### Backend Development

```bash
# Run with auto-reload
uvicorn app.main:app --reload

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Run tests (if available)
pytest
```

### Frontend Development

```bash
# Development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint code
bun run lint
```

### Database Management

The application uses PostgreSQL with SQLAlchemy ORM. Database models are defined in `server/app/models/models.py`:

-   **Users**: Authentication and user management
-   **Contents**: Stored URLs with metadata and embeddings
-   **Tags**: Categorization system with usage tracking

## 🔧 API Endpoints

### Authentication

-   `POST /auth/signup` - User registration
-   `POST /auth/signin` - User login
-   `GET /auth/me` - Get current user

### Content Management

-   `GET /contents/` - List user contents
-   `POST /contents/` - Add new content
-   `PUT /contents/{id}` - Update content
-   `DELETE /contents/{id}` - Delete content
-   `POST /contents/search` - Search contents

### Tags

-   `GET /tags/` - List available tags
-   `POST /tags/search` - Search tags

### Users

-   `GET /users/{username}` - Get user profile
-   `PUT /users/{username}` - Update user profile

## 📊 Tech Stack

| Category           | Technology            | Purpose             |
| ------------------ | --------------------- | ------------------- |
| **Frontend**       | React 19 + TypeScript | UI Framework        |
|                    | Vite                  | Build Tool          |
|                    | Tailwind CSS          | Styling             |
|                    | Motion                | Animations          |
|                    | Zustand               | State Management    |
|                    | Axios                 | HTTP Client         |
| **Backend**        | FastAPI               | Web Framework       |
|                    | SQLAlchemy            | ORM                 |
|                    | Alembic               | Database Migrations |
|                    | Pydantic              | Data Validation     |
|                    | JWT                   | Authentication      |
| **Database**       | PostgreSQL            | Primary Database    |
|                    | Elasticsearch         | Search & Embeddings |
| **Infrastructure** | Docker                | Containerization    |
|                    | Docker Compose        | Local Development   |

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

-   Follow the existing code style and conventions
-   Write meaningful commit messages
-   Add tests for new features when possible
-   Update documentation as needed
-   Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

-   **GitHub Issues**: [Report bugs or request features](https://github.com/whoisasx/Memora/issues)
-   **Discussions**: [Join the community](https://github.com/whoisasx/Memora/discussions)

## 🙏 Acknowledgments

-   **FastAPI** for the excellent Python web framework
-   **React Team** for the amazing frontend library
-   **Elasticsearch** for powerful search capabilities
-   **Tailwind CSS** for making styling enjoyable
-   **Motion** for beautiful animations

---

<div align="center">
  <p>Built with ❤️ for better thinking</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
