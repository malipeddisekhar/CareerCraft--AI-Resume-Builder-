# AI Resume Builder

A full-stack web application that helps users build professional resumes with modern templates, AI-assisted writing, export options, and user-focused productivity features.

This project reflects my internship contribution in a real product-oriented development environment, where I worked across backend APIs, frontend experience, and integration workflows to deliver practical, user-facing functionality.

## Internship Contribution Summary

As an intern contributor, I worked on this project with a production mindset and gained strong exposure to real-world product development practices.

My contribution focused on:

- understanding product requirements and converting them into working features
- contributing to both backend and frontend modules in a shared codebase
- integrating APIs, improving data flow, and supporting reusable architecture
- debugging issues across layers and validating behavior end to end
- improving developer workflow through structured implementation and testing

This internship gave me direct experience in how real software products are planned, built, reviewed, and iteratively improved.

## What I Learned in a Real-World Product Environment

Through this project, I gained practical experience in:

- full-stack collaboration between UI, API, and database layers
- feature ownership from requirement analysis to delivery
- writing maintainable, modular, and scalable code
- handling real constraints such as changing requirements and integration issues
- balancing speed, code quality, and user experience
- understanding how product value is delivered through engineering decisions

I also learned professional development habits such as code organization, clear communication, iterative improvements, and accountability for shipped outcomes.

## Key Product Capabilities

Based on the current repository modules, this platform includes functionality such as:

- secure authentication and user account management
- resume creation and management workflows
- ATS scan and resume analysis support
- template management and template visibility controls
- dashboard and analytics features
- export and download capabilities
- newsletter and notification integrations
- admin tooling for platform-level operations
- AI-assisted service integration for resume-related workflows

## Tech Stack

### Frontend
- React (Vite)
- JavaScript (ES modules)
- Tailwind CSS and custom styles
- Axios-based API client layer

### Backend
- Node.js
- Express.js
- PostgreSQL integration
- File upload handling with Multer
- JWT-based token/auth middleware

## Repository Structure

```
AI-Resume-Builder/
  backend/
    controllers/
    routers/
    middlewares/
    Models/
    service/
    ai/
    config/
  frontend/
    src/
      components/
      pages/
      services/
      styles/
      utils/
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- PostgreSQL

### 1) Clone the repository

```bash
git clone https://github.com/Hemu2174/AI-Resume-Builder.git
cd AI-Resume-Builder
```

### 2) Install backend dependencies

```bash
cd backend
npm install
```

### 3) Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4) Configure environment variables

Create your environment configuration files for backend and frontend as required by your local setup.

Typical backend values include:

- database host, port, user, password, and name
- JWT secret and token settings
- API integration keys where applicable

### 5) Run backend

```bash
cd backend
npm run dev
```

### 6) Run frontend

```bash
cd frontend
npm run dev
```

Frontend and backend will run on their configured local ports.

## Engineering Approach During Internship

I approached this project as a product engineer in training, not just a task executor. That means I focused on:

- building features that solve actual user needs
- writing code that teammates can maintain and extend
- validating integration points instead of assuming components work in isolation
- keeping implementation aligned with overall platform architecture

This approach helped me develop confidence in delivering production-relevant features and collaborating effectively in a real development workflow.

## Future Improvements

Potential enhancements for the next iteration:

- expanded automated test coverage
- stronger input validation and API hardening
- improved performance profiling and optimization
- richer template customization options
- advanced AI guidance for resume quality and personalization

## Acknowledgement

This repository represents a meaningful part of my internship journey, where I gained hands-on exposure to real-world product development, engineering discipline, and full-stack feature delivery.

The experience strengthened both my technical foundation and my understanding of how modern software products are built in professional environments.
