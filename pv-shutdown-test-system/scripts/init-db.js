const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function initDatabase() {
  try {
    console.log('Initializing database schema...')
    
    // Read SQL schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute schema
    const { error } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (error) {
      console.error('Error executing schema:', error)
      process.exit(1)
    }
    
    console.log('Database schema initialized successfully!')
    
    // Create demo data
    console.log('Creating demo data...')
    
    // Create demo device
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .insert({
        id: 'PV-RSD-001',
        device_name: 'Demo Rapid Shutdown Device',
        device_type: 'Rapid Shutdown Device',
        manufacturer: 'Demo Manufacturer',
        model: 'RSD-1000',
        serial_number: 'SN-001',
        rated_voltage: 1000,
        rated_current: 30,
        rated_power: 30000,
        status: 'active',
      })
      .select()
      .single()
    
    if (deviceError) {
      console.error('Error creating demo device:', deviceError)
    } else {
      console.log('Demo device created:', device.id)
    }
    
    console.log('Database initialization complete!')
    
  } catch (error) {
    console.error('Initialization failed:', error)
    process.exit(1)
  }
}

initDatabase()