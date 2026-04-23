#!/usr/bin/env node
// Render deployment checker script

const CHECKS = {
  // 1. Test if Render URL is reachable
  testRenderURL: async () => {
    const url = 'https://progressoverview-1.onrender.com';
    console.log(`🔍 Testing ${url}...`);
    
    try {
      const response = await fetch(`${url}/api/health`);
      const data = await response.json();
      console.log('✅ Backend is UP:', data);
      return true;
    } catch (err) {
      console.log('❌ Backend is DOWN or sleeping:', err.message);
      console.log('   → If free tier: Wait 30-60s for it to wake up');
      return false;
    }
  },

  // 2. Test auth endpoint
  testAuth: async () => {
    const url = 'https://progressoverview-1.onrender.com';
    console.log(`\n🔍 Testing ${url}/api/test-server...`);
    
    try {
      const response = await fetch(`${url}/api/test-server`);
      const data = await response.json();
      console.log('✅ Auth endpoint OK:', data);
      return true;
    } catch (err) {
      console.log('❌ Auth endpoint failed:', err.message);
      return false;
    }
  }
};

async function runChecks() {
  console.log('=== Render Deployment Checker ===\n');
  
  await CHECKS.testRenderURL();
  await CHECKS.testAuth();
  
  console.log('\n=== Debugging Tips ===');
  console.log('1. 503 Error = Service Unavailable');
  console.log('   - Free tier: Service sleeps after 15min inactivity');
  console.log('   - First request wakes it up (30-60s delay)');
  console.log('   - Check Render Dashboard → Logs');
  console.log('\n2. Check these on Render Dashboard:');
  console.log('   - Build Command: npm install');
  console.log('   - Start Command: npm start');
  console.log('   - Root Directory: server (or ./ if root has package.json)');
  console.log('   - Environment Variables: DATABASE_URL, JWT_SECRET, PORT');
}

runChecks();
