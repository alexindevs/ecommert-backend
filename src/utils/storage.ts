import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '/uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    const fileExtension = originalName.split('.').pop();
    const filename = `${Date.now()}-${uuidv4()}.${fileExtension}`;
    cb(null, filename);
  },
});

export const upload = multer({ storage: storage });