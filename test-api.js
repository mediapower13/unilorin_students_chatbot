// Simple test to check backend API
const testAPI = async () => {
  try {
    console.log('Testing backend API...')
    
    // Test 1: Check if backend is alive
    const healthResponse = await fetch('https://unisup-9n5t.onrender.com/')
    const healthText = await healthResponse.text()
    console.log('Health check:', healthText)
    
    // Test 2: Try chat endpoint
    const chatResponse = await fetch('https://unisup-9n5t.onrender.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello',
        user_id: 'test_user_123'
      })
    })
    
    console.log('Chat response status:', chatResponse.status)
    console.log('Chat response ok:', chatResponse.ok)
    
    if (chatResponse.ok) {
      const data = await chatResponse.json()
      console.log('Chat response data:', data)
    } else {
      const errorText = await chatResponse.text()
      console.log('Chat error response:', errorText)
    }
    
  } catch (error) {
    console.error('Error testing API:', error)
  }
}

testAPI()
