# 🚀 CodeReview AI - Simple AI-Powered Code Review

A beautiful full-stack application that uses **Claude AI** to review your code and provide intelligent suggestions. **No authentication required** - just enter your name and start reviewing!

![Laravel](https://img.shields.io/badge/Laravel-10.x-red)
![React](https://img.shields.io/badge/React-18.x-blue)
![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204-purple)

---

## ✨ Features

### 🔍 **AI-Powered Analysis**
- **Security** - SQL injection, XSS, authentication issues
- **Performance** - N+1 queries, memory leaks, slow algorithms
- **Code Quality** - Naming, duplication, complexity
- **Best Practices** - Design patterns, error handling

### 📊 **User Features**
- No login required - just enter your name
- Submit code and get instant AI feedback
- View review history
- Track statistics and improvements
- Beautiful, modern UI

### 🎨 **Languages Supported**
JavaScript, PHP, Python, Java, C#, Ruby, Go, TypeScript, Swift, Kotlin

---

## 🎯 How It Works

1. **Enter Your Name** - Stored locally, no account needed
2. **Paste Your Code** - Select language and filename
3. **Get AI Review** - Claude analyzes in seconds
4. **Fix Issues** - Review detailed suggestions
5. **Track Progress** - See your improvement over time

---

## 🏗️ Tech Stack

**Backend:**
- Laravel 10.x
- MySQL
- Redis (for queues)
- Claude AI API

**Frontend:**
- React 18.x
- Tailwind CSS
- Lucide Icons

---

## 🚀 Installation

### Prerequisites
```bash
# Required
- PHP 8.1+
- Composer
- MySQL 8.0+
- Redis
- Node.js 16+
- Anthropic API Key
```

### Backend Setup
```bash
# Create Laravel project
composer create-project laravel/laravel codereview-ai-backend
cd codereview-ai-backend

# Copy all backend files from artifacts

# Configure .env
DB_DATABASE=codereview_ai
ANTHROPIC_API_KEY=your_api_key_here
QUEUE_CONNECTION=redis

# Run migrations
php artisan migrate

# Start server
php artisan serve

# Start queue worker (separate terminal)
php artisan queue:work
```

### Frontend Setup
```bash
# Create React app
npx create-react-app codereview-ai-frontend
cd codereview-ai-frontend

# Install dependencies
npm install axios lucide-react

# Replace src/App.js with artifact code

# Start app
npm start
```

---

## 📁 Project Structure

### Backend (Laravel)
```
app/
├── Http/
│   ├── Controllers/Api/
│   │   └── CodeReviewController.php
│   ├── Resources/
│   │   ├── CodeReviewResource.php
│   │   └── CodeIssueResource.php
│   └── Requests/
│       └── SubmitCodeRequest.php
├── Models/
│   ├── CodeReview.php
│   └── CodeIssue.php
├── Services/
│   └── ClaudeAIService.php
└── Jobs/
    └── AnalyzeCodeJob.php
```

### Frontend (React)
```
src/
└── App.js (Complete single-page app)
```

---

## 🔌 API Endpoints

### Submit Code
```http
POST /api/reviews
Content-Type: application/json

{
  "user_name": "John Doe",
  "filename": "UserController.php",
  "language": "php",
  "code": "<?php\n// Your code here"
}
```

### Get Reviews
```http
GET /api/reviews?user_name=John Doe
```

### Get Single Review
```http
GET /api/reviews/{id}
```

### Delete Review
```http
DELETE /api/reviews/{id}
```

### Get Statistics
```http
GET /api/stats?user_name=John Doe
```

---

## 💡 Example Usage

### Submit PHP Code:
```php
$sql = "SELECT * FROM users WHERE id = " . $_GET['id'];
$result = mysqli_query($conn, $sql);
```

### AI Detects:
- ❌ **HIGH** - SQL Injection vulnerability
- ⚠️ **MEDIUM** - No error handling
- ℹ️ **LOW** - Missing input validation

### Get Suggestions:
- Use prepared statements
- Add try-catch blocks
- Validate user input

---

## 🎨 Screenshots

### Submit Code
Clean interface for submitting code with language selection.

### Analysis Results
Color-coded severity levels with detailed explanations.

### History & Analytics
Track all your reviews and see improvement trends.

---

## 🐛 Troubleshooting

### Queue Not Working
```bash
# Check Redis
redis-cli ping

# Restart queue
php artisan queue:restart
php artisan queue:work
```

### CORS Errors
Update `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:3000'],
```

### API Timeout
Increase timeout in `ClaudeAIService.php`:
```php
->timeout(180)
```

---

## 🎓 Learning Points

This project demonstrates:
- ✅ Full-stack development (Laravel + React)
- ✅ AI API integration (Anthropic Claude)
- ✅ Asynchronous processing (Queue jobs)
- ✅ RESTful API design
- ✅ Modern UI/UX patterns
- ✅ Database relationships
- ✅ Error handling
- ✅ Real-time updates

---

## 🚢 Deployment

### Backend
```bash
php artisan config:cache
php artisan route:cache
php artisan optimize
```

### Frontend
```bash
npm run build
# Deploy build/ folder
```

---

## 📝 License

MIT License - Feel free to use for your portfolio!

---

## 🙏 Credits

- **Anthropic** - Claude AI
- **Laravel** - PHP Framework
- **React** - UI Library
- **Tailwind CSS** - Styling

---

## 🎯 Why This Project is Great for Your Portfolio

1. **AI Integration** - Shows you can work with cutting-edge tech
2. **Full-Stack** - Demonstrates backend and frontend skills
3. **Clean Code** - Well-structured, maintainable code
4. **Modern UI** - Beautiful, responsive design
5. **Real Problem** - Solves actual developer needs
6. **Scalable** - Queue-based architecture
7. **Production-Ready** - Error handling, validation, logging

---

## 📞 Support

Need help? Check the installation guide or open an issue.

---

**Built with ❤️ using Laravel, React, and Claude AI**

Start reviewing code smarter, not harder! 🚀