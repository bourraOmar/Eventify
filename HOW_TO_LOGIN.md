# 🔐 How to Login as Admin

You keep getting **401 Unauthorized** errors because you're trying to access the admin dashboard **without logging in first**.

## ✅ **Step-by-Step Login Instructions:**

### **Step 1: Clear Your Browser Data**
Open browser console (F12) and run:
```javascript
localStorage.clear();
```

### **Step 2: Go to Login Page**
Navigate to: **`http://localhost:3000/login`**

### **Step 3: Enter Admin Credentials**
- **Email:** `admin@eventify.com`
- **Password:** `Admin@123`

### **Step 4: Click "Login"**
You should be automatically redirected to `/dashboard/admin`

### **Step 5: Verify You're Logged In**
Open console (F12) and check:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

You should see:
- **Token:** A long JWT string (starts with "eyJ...")
- **User:** JSON object with your admin info

---

## ❌ **Common Mistakes:**

### **Mistake 1: Going directly to /dashboard/admin**
❌ **DON'T:** Type `http://localhost:3000/dashboard/admin` in the URL bar  
✅ **DO:** Go to `/login` first, then you'll be redirected automatically

### **Mistake 2: Not clearing localStorage**
If you have old/invalid tokens, clear them:
```javascript
localStorage.clear();
```

### **Mistake 3: Wrong credentials**
Make sure you're using:
- Email: `admin@eventify.com` (not "admin" or anything else)
- Password: `Admin@123` (case-sensitive!)

---

## 🔍 **Troubleshooting:**

### **Problem: "Invalid credentials" error**
**Solution:** The admin user might not exist. Run this command:
```bash
cd backend
npm run create-admin
```

### **Problem: Still getting 401 after login**
**Solution:** Check if token is being stored:
1. Login
2. Open console (F12)
3. Run: `localStorage.getItem('token')`
4. If it's `null`, there's an issue with the login flow

### **Problem: Page keeps redirecting to login**
**Solution:** This means you're not logged in. Follow Step 1-4 above.

---

## 📝 **Summary:**

**The 401 error means: "You're not logged in"**

**To fix it:**
1. Clear localStorage
2. Go to `/login` (not `/dashboard/admin`)
3. Enter credentials
4. Login
5. You'll be redirected to dashboard automatically

**Stop trying to access `/dashboard/admin` directly!** Always login first.
