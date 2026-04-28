const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/schedule', (req, res) => {
    const { users, machines } = req.body;
    
    let inputData = `${machines.length}\n`;
    machines.forEach(m => {
        inputData += `${m.name.replace(/\s+/g, '_')} ${m.quantity}\n`;
    });
    
    inputData += `${users.length}\n`;
    users.forEach(u => {
        const uName = u.name.replace(/\s+/g, '_');
        inputData += `${uName} ${u.preferred_slot} ${u.priority} ${u.equipment.length}`;
        u.equipment.forEach(e => {
            inputData += ` ${e.replace(/\s+/g, '_')}`;
        });
        inputData += '\n';
    });
    
    const inputPath = path.join(__dirname, 'input.txt');
    const outputPath = path.join(__dirname, 'output.txt');
    const schedulerPath = path.join(__dirname, '../algorithm', 'scheduler');
    
    fs.writeFileSync(inputPath, inputData);
    
    const cmd = `"${schedulerPath}" < "${inputPath}" > "${outputPath}"`;
    
    exec(cmd, { cwd: path.join(__dirname, '../algorithm') }, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            console.error(stderr);
            return res.status(500).json({ error: 'C Algorithm failed to execute' });
        }
        
        try {
            const outputData = fs.readFileSync(outputPath, 'utf8');
            const result = JSON.parse(outputData);
            res.json(result);
        } catch (e) {
            console.error('Failed to parse C output:', e);
            res.status(500).json({ error: 'Failed to parse algorithm output' });
        }
    });
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
