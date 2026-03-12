# File Upload & Download API - Backend Setup Guide

## Tổng quan

Hướng dẫn setup backend API để test upload file/video và get download link trong app.

## Backend API Endpoint Required

### 1. Upload File Endpoint

**POST** `/api/upload`

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {token} (optional)
```

**Body (FormData):**
```
file: File (binary)
category: string (optional) - "general" | "projects" | "profiles" | "documents"
description: string (optional)
tags: string (optional) - comma separated
```

**Response Success (200/201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "id": "file_abc123",
    "filename": "1234567890_myfile.jpg",
    "originalName": "myfile.jpg",
    "mimeType": "image/jpeg",
    "size": 102400,
    "url": "http://localhost:3000/uploads/1234567890_myfile.jpg",
    "downloadUrl": "http://localhost:3000/api/download/file_abc123",
    "path": "/uploads/1234567890_myfile.jpg",
    "uploadedAt": "2025-12-16T10:30:00.000Z"
  }
}
```

**Response Error (400/500):**
```json
{
  "success": false,
  "message": "File upload failed",
  "error": "File too large"
}
```

### 2. Download File Endpoint (Optional)

**GET** `/api/download/:fileId`

**Response:**
- Trả về file binary với headers phù hợp
- Content-Disposition: attachment

---

## Backend Implementation Examples

### Node.js + Express + Multer

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept images, videos, documents
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileId = `file_${Date.now()}`;
    const baseUrl = `http://${req.hostname}:${PORT}`;
    
    const fileData = {
      id: fileId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `${baseUrl}/uploads/${req.file.filename}`,
      downloadUrl: `${baseUrl}/api/download/${fileId}`,
      path: `/uploads/${req.file.filename}`,
      uploadedAt: new Date().toISOString(),
      category: req.body.category || 'general',
      description: req.body.description || '',
      tags: req.body.tags ? req.body.tags.split(',') : [],
    };

    // In production, save fileData to database
    // For demo, just store in memory or file
    global.uploadedFiles = global.uploadedFiles || {};
    global.uploadedFiles[fileId] = fileData;

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: fileData
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Download endpoint
app.get('/api/download/:fileId', (req, res) => {
  try {
    const fileId = req.params.fileId;
    const fileData = global.uploadedFiles?.[fileId];
    
    if (!fileData) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const filePath = path.join(uploadDir, fileData.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }

    res.download(filePath, fileData.originalName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Download failed',
      error: error.message
    });
  }
});

// Serve static uploads
app.use('/uploads', express.static(uploadDir));

// CORS for mobile app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Upload endpoint: http://0.0.0.0:${PORT}/api/upload`);
});
```

---

### Python + Flask

```python
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
import time
from datetime import datetime

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'pdf', 'doc', 'docx'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

uploaded_files = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file part'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No selected file'
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': 'File type not allowed'
            }), 400
        
        # Generate unique filename
        timestamp = int(time.time() * 1000)
        original_name = secure_filename(file.filename)
        filename = f"{timestamp}_{original_name}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save file
        file.save(filepath)
        
        # Get file info
        file_size = os.path.getsize(filepath)
        file_id = f"file_{timestamp}"
        
        file_data = {
            'id': file_id,
            'filename': filename,
            'originalName': original_name,
            'mimeType': file.content_type,
            'size': file_size,
            'url': f"http://localhost:5000/uploads/{filename}",
            'downloadUrl': f"http://localhost:5000/api/download/{file_id}",
            'path': f"/uploads/{filename}",
            'uploadedAt': datetime.utcnow().isoformat(),
            'category': request.form.get('category', 'general'),
            'description': request.form.get('description', ''),
            'tags': request.form.get('tags', '').split(',') if request.form.get('tags') else [],
        }
        
        uploaded_files[file_id] = file_data
        
        return jsonify({
            'success': True,
            'message': 'File uploaded successfully',
            'file': file_data
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Upload failed',
            'error': str(e)
        }), 500

@app.route('/api/download/<file_id>', methods=['GET'])
def download_file(file_id):
    try:
        if file_id not in uploaded_files:
            return jsonify({
                'success': False,
                'message': 'File not found'
            }), 404
        
        file_data = uploaded_files[file_id]
        filepath = os.path.join(UPLOAD_FOLDER, file_data['filename'])
        
        if not os.path.exists(filepath):
            return jsonify({
                'success': False,
                'message': 'File not found on disk'
            }), 404
        
        return send_file(
            filepath,
            as_attachment=True,
            download_name=file_data['originalName']
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Download failed',
            'error': str(e)
        }), 500

@app.route('/uploads/<filename>', methods=['GET'])
def serve_file(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        return send_file(filepath)
    return jsonify({'error': 'File not found'}), 404

# CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

---

## Quick Start (Node.js)

### 1. Install dependencies:

```bash
npm install express multer cors
```

### 2. Create `server.js`:

Copy Node.js code example above

### 3. Run server:

```bash
node server.js
```

### 4. Update app config:

Trong file `app/profile/file-upload-demo.tsx`, thay đổi:

```typescript
const uploadTask = FileSystem.createUploadTask(
  'http://192.168.1.105:3000/api/upload', // Thay IP này
  ...
);
```

Thay `192.168.1.105` bằng IP máy tính chạy server (LAN IP).

---

## Testing

### Test với Postman/curl:

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/file.jpg" \
  -F "category=general" \
  -F "description=Test upload"
```

### Expected Response:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "id": "file_1734345678000",
    "filename": "1734345678000_file.jpg",
    "originalName": "file.jpg",
    "url": "http://localhost:3000/uploads/1734345678000_file.jpg",
    "downloadUrl": "http://localhost:3000/api/download/file_1734345678000"
  }
}
```

---

## Security Considerations (Production)

1. **Authentication**: Add JWT token verification
2. **File Validation**: 
   - Check file signatures (magic bytes)
   - Scan for malware
   - Validate file size
3. **Storage**:
   - Use cloud storage (AWS S3, Google Cloud Storage, Azure Blob)
   - Generate signed URLs for downloads
4. **Rate Limiting**: Prevent abuse
5. **HTTPS**: Always use HTTPS in production

---

## Cloud Storage Integration

### AWS S3 Example:

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const params = {
      Bucket: 'your-bucket-name',
      Key: `uploads/${req.file.filename}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read'
    };
    
    const s3Result = await s3.upload(params).promise();
    
    res.json({
      success: true,
      file: {
        url: s3Result.Location,
        downloadUrl: s3Result.Location
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## Troubleshooting

### Issue: "Network Error"

**Solution:** Kiểm tra firewall, đảm bảo server đang chạy và app có thể kết nối.

### Issue: "File too large"

**Solution:** Tăng giới hạn trong Multer config hoặc server config.

### Issue: "CORS Error"

**Solution:** Thêm CORS headers như example trên.

---

## Next Steps

1. ✅ Chạy backend server (Node.js hoặc Python)
2. ✅ Cập nhật IP trong app code
3. ✅ Test upload ảnh/video từ app
4. ✅ Verify download link hoạt động
5. ✅ Deploy server lên production (Heroku, Railway, Vercel, etc.)

---

**Lưu ý:** Demo này dùng local server. Trong production, nên dùng cloud storage và CDN để tối ưu performance.
