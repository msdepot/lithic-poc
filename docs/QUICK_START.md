# Lithic POC - Quick Start Guide

## 🚀 **Get Running in 5 Minutes**

### **Prerequisites Check**
```bash
# Verify installations
node --version    # Should show v18.20.8
docker --version  # Should show Docker version
./supabase-cli --version  # Should show Supabase CLI version
```

### **Start Everything**
```bash
# 1. Start database with web interface
./supabase-cli start

# 2. Activate Node.js environment  
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Start API server
npm run dev

# 4. Verify everything is running
curl http://localhost:3000/health
```

### **Expected Output**
```json
{
  "status": "healthy",
  "services": {
    "database": "healthy", 
    "lithic_api": "healthy"
  }
}
```

### **Access Points**
- 🌐 **API:** http://localhost:3000
- 📊 **Database Studio:** http://127.0.0.1:54323  
- 🏥 **Health Check:** http://localhost:3000/health

## 📮 **Test with Postman**

### **Import Collection**
1. Open Postman
2. Import: `Lithic_POC_Corrected_Flow.postman_collection.json`
3. Create environment: `base_url` = `http://localhost:3000/api`

### **Run Test Scenario**
1. **🔐 Phase 1:** Foundation Setup (Login, Create Eric, Create MSD Cafe)
2. **👥 Phase 2:** User Hierarchy (Create Medina family)
3. **💳 Phase 3:** Card Creation (Cards for family members)
4. **🔍 Phase 4:** Validation (Test RBAC and operations)

### **Monitor Real-Time**
- **Watch Supabase Studio** as data is created
- **Check API logs** in terminal
- **Verify Lithic integration** with real account holders

## 🛑 **Shutdown**
```bash
# Stop API server (Ctrl+C in terminal)
# Stop Supabase
./supabase-cli stop
```

## ⚡ **Restart**
```bash
# Same as start commands above
./supabase-cli start
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

Your complete Lithic POC is ready to demonstrate! 🎉
