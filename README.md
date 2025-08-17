# 💊 MediVault

**MediVault** is a secure medicine management platform built with **Node.js, Express, MongoDB, and EJS**.  
It allows users to manage prescriptions, track medicines, and organize health records in a structured way.  

This project demonstrates **backend development, authentication, error handling, and database integration skills**.

## 🌐 Live Demo
You can explore the deployed app here:  
👉 [MediVault Live on Render](https://medivault-jww6.onrender.com/)

## 🚀 Features
- 🔐 **User Authentication**: Register/login system with secure password storage.  
- 💊 **Medicine Management**: Add, edit, and delete medicines with full CRUD functionality.  
- 🩺 **Prescription Records**: Store prescriptions linked to users.  
- ⚡ **Error Handling**: Fixed critical bugs such as “medicine not defined” by restructuring controllers.  
- 🎨 **Templating with EJS**: Clean and simple UI rendered server-side.  

## 🛠 Tech Stack
- **Node.js + Express** → Backend framework for APIs and server logic  
- **MongoDB + Mongoose** → Database for users, medicines, and prescriptions  
- **EJS** → Templating engine for dynamic server-side rendering  
- **Passport.js (or session handling)** → For authentication & login persistence  
- **GitHub + Render** → Version control & deployment  

## 📂 Project Structure
MediVault/
│── models/ # Mongoose models (User, Medicine, Prescription)
│── routes/ # Express routes
│── controllers/ # Business logic (authentication, medicine CRUD)
│── views/ # EJS templates
│── public/ # Static assets (CSS, JS)
│── app.js # Main Express server
│── README.md # Project documentation

## 🩺 Key Fixes Implemented
- ✅ Resolved **“medicine not defined” bug** → Refactored medicine controller & routes.  
- ✅ Improved error handling → Standardized error responses across routes.  
- ✅ Optimized data schema → Linked medicines properly with user accounts.  

## ⚡ Setup & Run Locally
```bash
# Clone repo
git clone https://github.com/your-username/MediVault.git
cd MediVault

# Install dependencies
npm install

# Start the server
node app.js
