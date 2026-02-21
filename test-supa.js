const fs = require('fs');

async function test() {
    const envContent = fs.readFileSync('./env.js', 'utf8');
    const urlMatch = envContent.match(/SUPABASE_URL:\s*'([^']+)'/);
    const keyMatch = envContent.match(/SUPABASE_KEY:\s*'([^']+)'/);
    const tableMatch = envContent.match(/SUPABASE_TABLE:\s*'([^']+)'/);

    const url = urlMatch[1];
    const key = keyMatch[1];
    const table = tableMatch[1];
    console.log("Testing auth for table:", table);

    const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=5`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });

    const body = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", body);
}
test();
